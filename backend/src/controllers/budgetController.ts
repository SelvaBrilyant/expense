import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req: Request, res: Response) => {
  const budgets = await prisma.budget.findMany({
    where: {
      userId: (req as any).user.id,
    },
  });
  res.json(budgets);
};

// @desc    Set a budget
// @route   POST /api/budgets
// @access  Private
export const setBudget = async (req: Request, res: Response) => {
  const { category, amount, period } = req.body;

  const budget = await prisma.budget.create({
    data: {
      userId: (req as any).user.id,
      category,
      amount: parseFloat(amount),
      period,
    },
  });

  res.status(201).json(budget);
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.budget.delete({
    where: { id },
  });

  res.json({ message: 'Budget removed' });
};
