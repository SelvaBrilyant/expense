import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get period date range
const getPeriodDates = (period: string) => {
  const now = new Date();
  let startDate = new Date();
  
  if (period === 'MONTHLY') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'WEEKLY') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'YEARLY') {
    startDate = new Date(now.getFullYear(), 0, 1);
  }
  
  return { startDate, endDate: now };
};

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

// @desc    Get budgets with spending data
// @route   GET /api/budgets/spending
// @access  Private
export const getBudgetsWithSpending = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const budgets = await prisma.budget.findMany({
    where: { userId },
  });

  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const { startDate, endDate } = getPeriodDates(budget.period);

      // Calculate total spent in this category during the period
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          category: budget.category,
          type: 'EXPENSE',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      // Calculate days left in period
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, totalDays - daysElapsed);

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        daysLeft,
        status: percentage >= 100 ? 'OVER' : percentage >= 90 ? 'CRITICAL' : percentage >= 75 ? 'WARNING' : 'ON_TRACK',
      };
    })
  );

  res.json(budgetsWithSpending);
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

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category, amount, period } = req.body;

  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }

  if (budget.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: {
      category,
      amount: amount ? parseFloat(amount) : undefined,
      period,
    },
  });

  res.json(updatedBudget);
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
