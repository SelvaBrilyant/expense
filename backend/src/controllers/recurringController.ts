import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all recurring transactions
// @route   GET /api/recurring
// @access  Private
export const getRecurringTransactions = async (req: Request, res: Response) => {
  const recurring = await prisma.recurringTransaction.findMany({
    where: {
      userId: (req as any).user.id,
    },
    orderBy: {
      nextDueDate: 'asc',
    },
  });

  res.json(recurring);
};

// @desc    Create recurring transaction
// @route   POST /api/recurring
// @access  Private
export const createRecurringTransaction = async (req: Request, res: Response) => {
  const { title, amount, type, category, paymentMethod, frequency, nextDueDate, daysOfWeek } = req.body;

  const recurring = await prisma.recurringTransaction.create({
    data: {
      userId: (req as any).user.id,
      title,
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod,
      frequency,
      nextDueDate: new Date(nextDueDate),
      daysOfWeek: daysOfWeek || [],
    },
  });

  res.status(201).json(recurring);
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring/:id
// @access  Private
export const updateRecurringTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, amount, type, category, paymentMethod, frequency, nextDueDate, isActive, daysOfWeek } = req.body;

  const recurring = await prisma.recurringTransaction.findUnique({
    where: { id },
  });

  if (!recurring) {
    res.status(404);
    throw new Error('Recurring transaction not found');
  }

  if (recurring.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedRecurring = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      title,
      amount: amount ? parseFloat(amount) : undefined,
      type,
      category,
      paymentMethod,
      frequency,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
      isActive,
      daysOfWeek: daysOfWeek !== undefined ? daysOfWeek : undefined,
    },
  });

  res.json(updatedRecurring);
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
export const deleteRecurringTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  const recurring = await prisma.recurringTransaction.findUnique({
    where: { id },
  });

  if (!recurring) {
    res.status(404);
    throw new Error('Recurring transaction not found');
  }

  if (recurring.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await prisma.recurringTransaction.delete({
    where: { id },
  });

  res.json({ message: 'Recurring transaction removed' });
};

// @desc    Toggle recurring transaction active status
// @route   POST /api/recurring/:id/toggle
// @access  Private
export const toggleRecurringTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  const recurring = await prisma.recurringTransaction.findUnique({
    where: { id },
  });

  if (!recurring) {
    res.status(404);
    throw new Error('Recurring transaction not found');
  }

  if (recurring.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedRecurring = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      isActive: !recurring.isActive,
    },
  });

  res.json(updatedRecurring);
};
