import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all savings
// @route   GET /api/savings
// @access  Private
export const getSavings = async (req: Request, res: Response) => {
  const { category, isCompleted, priority } = req.query;

  const where: any = {
    userId: (req as any).user.id,
  };

  if (category) {
    where.category = category;
  }

  if (isCompleted !== undefined) {
    where.isCompleted = isCompleted === 'true';
  }

  if (priority) {
    where.priority = priority;
  }

  const savings = await prisma.saving.findMany({
    where,
    orderBy: [
      { priority: 'asc' }, // HIGH first, then MEDIUM, then LOW
      { deadline: 'asc' }, // Earliest deadline first
    ],
  });

  res.json(savings);
};

// @desc    Get saving by ID
// @route   GET /api/savings/:id
// @access  Private
export const getSavingById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const saving = await prisma.saving.findUnique({
    where: { id },
  });

  if (!saving) {
    res.status(404);
    throw new Error('Saving not found');
  }

  if (saving.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  res.json(saving);
};

// @desc    Create a saving
// @route   POST /api/savings
// @access  Private
export const createSaving = async (req: Request, res: Response) => {
  const { title, targetAmount, currentAmount, category, priority, deadline, notes } = req.body;

  const saving = await prisma.saving.create({
    data: {
      userId: (req as any).user.id,
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      category: category || 'OTHER',
      priority: priority || 'MEDIUM',
      deadline: deadline ? new Date(deadline) : null,
      notes,
      isCompleted: false,
    },
  });

  res.status(201).json(saving);
};

// @desc    Update saving
// @route   PUT /api/savings/:id
// @access  Private
export const updateSaving = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, targetAmount, currentAmount, category, priority, deadline, notes, isCompleted } = req.body;

  const saving = await prisma.saving.findUnique({
    where: { id },
  });

  if (!saving) {
    res.status(404);
    throw new Error('Saving not found');
  }

  if (saving.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedSaving = await prisma.saving.update({
    where: { id },
    data: {
      title,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
      category,
      priority,
      deadline: deadline ? new Date(deadline) : undefined,
      notes,
      isCompleted,
    },
  });

  res.json(updatedSaving);
};

// @desc    Delete saving
// @route   DELETE /api/savings/:id
// @access  Private
export const deleteSaving = async (req: Request, res: Response) => {
  const { id } = req.params;

  const saving = await prisma.saving.findUnique({
    where: { id },
  });

  if (!saving) {
    res.status(404);
    throw new Error('Saving not found');
  }

  if (saving.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await prisma.saving.delete({
    where: { id },
  });

  res.json({ message: 'Saving removed' });
};

// @desc    Add to saving
// @route   PATCH /api/savings/:id/add
// @access  Private
export const addToSaving = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  const saving = await prisma.saving.findUnique({
    where: { id },
  });

  if (!saving) {
    res.status(404);
    throw new Error('Saving not found');
  }

  if (saving.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const newCurrentAmount = saving.currentAmount + parseFloat(amount);
  const isCompleted = newCurrentAmount >= saving.targetAmount;

  const updatedSaving = await prisma.saving.update({
    where: { id },
    data: {
      currentAmount: newCurrentAmount,
      isCompleted,
    },
  });

  res.json(updatedSaving);
};

// @desc    Withdraw from saving
// @route   PATCH /api/savings/:id/withdraw
// @access  Private
export const withdrawFromSaving = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  const saving = await prisma.saving.findUnique({
    where: { id },
  });

  if (!saving) {
    res.status(404);
    throw new Error('Saving not found');
  }

  if (saving.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const newCurrentAmount = Math.max(0, saving.currentAmount - parseFloat(amount));
  const isCompleted = newCurrentAmount >= saving.targetAmount;

  const updatedSaving = await prisma.saving.update({
    where: { id },
    data: {
      currentAmount: newCurrentAmount,
      isCompleted,
    },
  });

  res.json(updatedSaving);
};
