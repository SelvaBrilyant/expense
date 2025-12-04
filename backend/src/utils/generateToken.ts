import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || JWT_SECRET + "_refresh";

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

export interface TokenPayload {
  id: string;
  type: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiry in seconds
}

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId, type: "access" }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate a unique refresh token
 */
const generateRefreshTokenString = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Create and store a new refresh token
 */
export const createRefreshToken = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> => {
  const token = generateRefreshTokenString();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return token;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TokenPair> => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = await createRefreshToken(userId, ipAddress, userAgent);

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
};

/**
 * Verify and decode access token
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded.type !== "access") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Rotate refresh token - invalidate old one and create new one
 */
export const rotateRefreshToken = async (
  oldToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TokenPair | null> => {
  // Find the existing refresh token
  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  // Validate the token
  if (!existingToken) {
    return null;
  }

  if (existingToken.isRevoked) {
    // Token reuse detected! Revoke all tokens for this user
    await revokeAllUserTokens(existingToken.userId);
    return null;
  }

  if (existingToken.expiresAt < new Date()) {
    // Token expired
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { isRevoked: true },
    });
    return null;
  }

  // Revoke the old token
  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: { isRevoked: true },
  });

  // Generate new token pair
  return generateTokenPair(existingToken.userId, ipAddress, userAgent);
};

/**
 * Revoke a specific refresh token
 */
export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Revoke all refresh tokens for a user
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
};

/**
 * Clean up expired refresh tokens (call periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
    },
  });
  return result.count;
};

/**
 * Get active sessions for a user
 */
export const getUserActiveSessions = async (userId: string) => {
  return prisma.refreshToken.findMany({
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
};

// Legacy support - generates long-lived token (for backward compatibility)
const generateLegacyToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateLegacyToken;
