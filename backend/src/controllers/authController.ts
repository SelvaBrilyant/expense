import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken';

import { sendOnboardingEmail } from '../services/emailService';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, profilePicture, coverPicture, dateOfBirth, bio, phoneNumber } = req.body;

  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
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
    sendOnboardingEmail(user.email, user.name || 'User');

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
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

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
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
    },
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).user.id },
  });

  if (user) {
    const { name, email, password, profilePicture, coverPicture, dateOfBirth, bio, phoneNumber } = req.body;

    // Update fields if provided - use ?? instead of || to allow empty strings
    const updatedData: any = {
      name: name ?? user.name,
      email: email ?? user.email,
      profilePicture: profilePicture !== undefined ? profilePicture : user.profilePicture,
      coverPicture: coverPicture !== undefined ? coverPicture : user.coverPicture,
      bio: bio !== undefined ? bio : user.bio,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
    };

    if (dateOfBirth) {
      updatedData.dateOfBirth = new Date(dateOfBirth);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
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

    res.json({
      ...updatedUser,
      token: generateToken(updatedUser.id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};
