import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import generateToken, {
  generateTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "../utils/generateToken";
import {
  validatePassword,
  getPasswordStrengthLabel,
} from "../utils/passwordValidator";
import {
  logSecurityEventFromRequest,
  getClientIp,
  getUserAgent,
} from "../services/securityLogger";

import {
  sendOnboardingEmail,
  sendPasswordResetOTP,
} from "../services/emailService";

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    profilePicture,
    coverPicture,
    dateOfBirth,
    bio,
    phoneNumber,
  } = req.body;

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(
      `Password validation failed: ${passwordValidation.errors.join(", ")}`
    );
  }

  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profilePicture,
      coverPicture,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bio,
      phoneNumber,
    },
  });

  if (user) {
    // Send onboarding email
    sendOnboardingEmail(user.email, user.name || "User");

    // Generate token pair for new user
    const tokens = await generateTokenPair(
      user.id,
      getClientIp(req),
      getUserAgent(req)
    );

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Check if account is locked
  if (user && user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
    );

    await logSecurityEventFromRequest(
      req,
      "LOGIN_FAILED",
      user.id,
      `Account locked. ${minutesLeft} minutes remaining.`,
      false
    );

    res.status(423);
    throw new Error(
      `Account is temporarily locked. Please try again in ${minutesLeft} minutes.`
    );
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isDeleted) {
      res.status(403);
      throw new Error("Account deleted. Please reactivate your account.");
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: getClientIp(req),
      },
    });

    // Log successful login
    await logSecurityEventFromRequest(req, "LOGIN_SUCCESS", user.id);

    // Generate token pair
    const tokens = await generateTokenPair(
      user.id,
      getClientIp(req),
      getUserAgent(req)
    );

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } else {
    // Increment failed attempts
    if (user) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: newFailedAttempts };

      // Lock account if max attempts exceeded
      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
        updateData.lockedUntil = lockUntil;

        await logSecurityEventFromRequest(
          req,
          "ACCOUNT_LOCKED",
          user.id,
          `Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts`
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await logSecurityEventFromRequest(
        req,
        "LOGIN_FAILED",
        user.id,
        `Failed attempt ${newFailedAttempts}/${MAX_LOGIN_ATTEMPTS}`,
        false
      );
    } else {
      // Log failed login for non-existent user (don't reveal user doesn't exist)
      await logSecurityEventFromRequest(
        req,
        "LOGIN_FAILED",
        undefined,
        `Login attempt for non-existent email: ${email.substring(0, 3)}***`,
        false
      );
    }

    res.status(401);
    throw new Error("Invalid email or password");
  }
};

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public (with valid refresh token)
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  const tokens = await rotateRefreshToken(
    refreshToken,
    getClientIp(req),
    getUserAgent(req)
  );

  if (!tokens) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }

  // Find user for logging
  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { token: tokens.refreshToken },
    select: { userId: true },
  });

  if (tokenRecord) {
    await logSecurityEventFromRequest(req, "TOKEN_REFRESH", tokenRecord.userId);
  }

  res.json({
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  });
};

// @desc    Logout user (revoke refresh token)
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const userId = (req as any).user?.id;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  if (userId) {
    await logSecurityEventFromRequest(req, "LOGOUT", userId);
  }

  res.json({ message: "Logged out successfully" });
};

// @desc    Logout from all devices
// @route   POST /api/users/logout-all
// @access  Private
export const logoutAllDevices = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  await revokeAllUserTokens(userId);
  await logSecurityEventFromRequest(
    req,
    "TOKEN_REVOKED",
    userId,
    "All refresh tokens revoked"
  );

  res.json({ message: "Logged out from all devices" });
};

// @desc    Google Auth
// @route   POST /api/users/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  const { credential, reactivate } = req.body;
  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user exists but no googleId, link it
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }

      if (user.isDeleted) {
        if (reactivate) {
          // Reactivate account
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              isDeleted: false,
              deletedAt: null,
            },
          });

          await logSecurityEventFromRequest(
            req,
            "ACCOUNT_REACTIVATED",
            user.id
          );
        } else {
          res.status(403);
          throw new Error("Account deleted. Please reactivate your account.");
        }
      }
    } else {
      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        Math.random().toString(36),
        salt
      ); // Random password

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profilePicture: picture,
          googleId,
        },
      });

      // Send onboarding email for new Google users too
      sendOnboardingEmail(user.email, user.name || "User");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: getClientIp(req),
      },
    });

    await logSecurityEventFromRequest(
      req,
      "LOGIN_SUCCESS",
      user.id,
      "Google SSO"
    );

    // Generate token pair
    const tokens = await generateTokenPair(
      user.id,
      getClientIp(req),
      getUserAgent(req)
    );

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    // Pass through our custom errors
    if (res.statusCode === 403) {
      throw error;
    }
    res.status(400);
    throw new Error("Google authentication failed");
  }
};

// @desc    Soft delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteAccount = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user) {
    // Revoke all tokens
    await revokeAllUserTokens(userId);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await logSecurityEventFromRequest(req, "ACCOUNT_DELETED", userId);

    res.json({ message: "Account deleted successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

// @desc    Reactivate user account
// @route   POST /api/users/reactivate
// @access  Public
export const reactivateAccount = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isDeleted) {
      res.status(400);
      throw new Error("Account is already active");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: false,
        deletedAt: null,
        lastLoginAt: new Date(),
        lastLoginIp: getClientIp(req),
      },
    });

    await logSecurityEventFromRequest(req, "ACCOUNT_REACTIVATED", user.id);

    const tokens = await generateTokenPair(
      user.id,
      getClientIp(req),
      getUserAgent(req)
    );

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).user.id },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      profilePicture: true,
      coverPicture: true,
      dateOfBirth: true,
      bio: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user) {
    const {
      name,
      email,
      password,
      profilePicture,
      coverPicture,
      dateOfBirth,
      bio,
      phoneNumber,
    } = req.body;

    // Update fields if provided - use ?? instead of || to allow empty strings
    const updatedData: any = {
      name: name ?? user.name,
      email: email ?? user.email,
      profilePicture:
        profilePicture !== undefined ? profilePicture : user.profilePicture,
      coverPicture:
        coverPicture !== undefined ? coverPicture : user.coverPicture,
      bio: bio !== undefined ? bio : user.bio,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
    };

    if (dateOfBirth) {
      updatedData.dateOfBirth = new Date(dateOfBirth);
    }

    if (password) {
      // Validate new password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400);
        throw new Error(
          `Password validation failed: ${passwordValidation.errors.join(", ")}`
        );
      }

      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);

      await logSecurityEventFromRequest(req, "PASSWORD_CHANGE", userId);

      // Revoke all other tokens for security
      await revokeAllUserTokens(userId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatedData,
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        profilePicture: true,
        coverPicture: true,
        dateOfBirth: true,
        bio: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logSecurityEventFromRequest(req, "PROFILE_UPDATED", userId);

    // Generate new tokens
    const tokens = await generateTokenPair(
      updatedUser.id,
      getClientIp(req),
      getUserAgent(req)
    );

    res.json({
      ...updatedUser,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

// @desc    Request password reset OTP
// @route   POST /api/users/forgot-password
// @access  Public
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // For security, don't reveal if email exists or not
  // Always return success message
  if (user) {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry to 10 minutes from now
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // Store OTP and expiry in database
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: otpExpiry,
      },
    });

    await logSecurityEventFromRequest(req, "PASSWORD_RESET_REQUEST", user.id);

    // Send OTP via email
    try {
      await sendPasswordResetOTP(user.email, user.name || "User", otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      res.status(500);
      throw new Error("Failed to send OTP email");
    }
  }

  res.json({
    message: "If the email exists, an OTP has been sent to your email address",
  });
};

// @desc    Verify reset OTP
// @route   POST /api/users/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Check if OTP matches
  if (user.resetPasswordOtp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  // Check if OTP has expired
  if (new Date() > user.resetPasswordOtpExpiry) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  res.json({
    message: "OTP verified successfully",
  });
};

// @desc    Reset password with OTP
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  // Validate password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(
      `Password validation failed: ${passwordValidation.errors.join(", ")}`
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Check if OTP matches
  if (user.resetPasswordOtp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  // Check if OTP has expired
  if (new Date() > user.resetPasswordOtpExpiry) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear OTP fields
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetPasswordOtp: null,
      resetPasswordOtpExpiry: null,
      failedLoginAttempts: 0, // Reset lockout
      lockedUntil: null,
    },
  });

  // Revoke all existing tokens
  await revokeAllUserTokens(user.id);

  await logSecurityEventFromRequest(req, "PASSWORD_RESET_SUCCESS", user.id);

  res.json({
    message: "Password reset successfully",
  });
};

// @desc    Validate password strength (utility endpoint)
// @route   POST /api/users/validate-password
// @access  Public
export const checkPasswordStrength = async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  const validation = validatePassword(password);

  res.json({
    isValid: validation.isValid,
    score: validation.score,
    strength: getPasswordStrengthLabel(validation.score),
    errors: validation.errors,
    suggestions: validation.suggestions,
  });
};

// @desc    Get user security logs
// @route   GET /api/users/security-logs
// @access  Private
export const getSecurityLogs = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const limit = parseInt(req.query.limit as string) || 50;

  const logs = await prisma.securityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
    select: {
      id: true,
      eventType: true,
      ipAddress: true,
      userAgent: true,
      details: true,
      success: true,
      createdAt: true,
    },
  });

  res.json(logs);
};

// @desc    Get active sessions
// @route   GET /api/users/sessions
// @access  Private
export const getActiveSessions = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const sessions = await prisma.refreshToken.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(sessions);
};

// @desc    Revoke a specific session
// @route   DELETE /api/users/sessions/:sessionId
// @access  Private
export const revokeSession = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { sessionId } = req.params;

  const session = await prisma.refreshToken.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  await prisma.refreshToken.update({
    where: { id: sessionId },
    data: { isRevoked: true },
  });

  await logSecurityEventFromRequest(
    req,
    "TOKEN_REVOKED",
    userId,
    `Session ${sessionId} revoked`
  );

  res.json({ message: "Session revoked successfully" });
};
