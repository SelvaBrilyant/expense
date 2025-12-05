import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to get period date range
const getPeriodDates = (period: string) => {
  const now = new Date();
  let startDate = new Date();

  if (period === "MONTHLY") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "WEEKLY") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "YEARLY") {
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
          type: "EXPENSE",
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
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysElapsed = Math.ceil(
        (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysLeft = Math.max(0, totalDays - daysElapsed);

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        daysLeft,
        status:
          percentage >= 100
            ? "OVER"
            : percentage >= 90
            ? "CRITICAL"
            : percentage >= 75
            ? "WARNING"
            : "ON_TRACK",
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
    throw new Error("Budget not found");
  }

  if (budget.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error("User not authorized");
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

  res.json({ message: "Budget removed" });
};

// @desc    Get budget insights and recommendations
// @route   GET /api/budgets/insights
// @access  Private
export const getBudgetInsights = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const budgets = await prisma.budget.findMany({
    where: { userId },
  });

  // Get 3 months of transactions for trend analysis
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: threeMonthsAgo },
    },
    orderBy: { date: "desc" },
  });

  // Calculate spending by category
  const categorySpending: { [key: string]: number[] } = {};
  const monthlySpending: { [month: string]: { [category: string]: number } } =
    {};

  transactions.forEach((t) => {
    const monthKey = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlySpending[monthKey]) monthlySpending[monthKey] = {};
    monthlySpending[monthKey][t.category] =
      (monthlySpending[monthKey][t.category] || 0) + t.amount;

    if (!categorySpending[t.category]) categorySpending[t.category] = [];
    categorySpending[t.category].push(t.amount);
  });

  const insights: {
    type: "warning" | "success" | "info" | "suggestion";
    category?: string;
    message: string;
    action?: string;
  }[] = [];

  // Analyze each budget
  budgets.forEach((budget) => {
    const { startDate, endDate } = getPeriodDates(budget.period);
    const periodTransactions = transactions.filter(
      (t) =>
        t.category === budget.category &&
        new Date(t.date) >= startDate &&
        new Date(t.date) <= endDate
    );
    const spent = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.amount) * 100;

    // Check for overspending
    if (percentage >= 100) {
      insights.push({
        type: "warning",
        category: budget.category,
        message: `You've exceeded your ${budget.category} budget by ${(
          spent - budget.amount
        ).toLocaleString("en-IN", { style: "currency", currency: "INR" })}`,
        action: `Consider increasing your budget or reducing ${budget.category} expenses`,
      });
    } else if (percentage >= 90) {
      insights.push({
        type: "warning",
        category: budget.category,
        message: `${budget.category} spending is at ${percentage.toFixed(
          0
        )}% of budget`,
        action: `Only ${(budget.amount - spent).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })} remaining`,
      });
    } else if (percentage <= 50) {
      insights.push({
        type: "success",
        category: budget.category,
        message: `Great job! ${
          budget.category
        } spending is well under control at ${percentage.toFixed(0)}%`,
      });
    }
  });

  // Suggest budgets for untracked high-spend categories
  const budgetCategories = new Set(budgets.map((b) => b.category));
  const unbugdetedSpending: { category: string; total: number }[] = [];

  Object.entries(categorySpending).forEach(([category, amounts]) => {
    if (!budgetCategories.has(category)) {
      const total = amounts.reduce((a, b) => a + b, 0);
      const avgMonthly = total / 3;
      if (avgMonthly > 5000) {
        unbugdetedSpending.push({ category, total: avgMonthly });
      }
    }
  });

  unbugdetedSpending
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .forEach(({ category, total }) => {
      insights.push({
        type: "suggestion",
        category,
        message: `You spend about ${total.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })} per month on ${category}`,
        action: `Consider setting a budget to track this category`,
      });
    });

  // Overall health score
  const budgetsWithData = budgets.length;
  const onTrack = budgets.filter((b) => {
    const { startDate, endDate } = getPeriodDates(b.period);
    const spent = transactions
      .filter(
        (t) =>
          t.category === b.category &&
          new Date(t.date) >= startDate &&
          new Date(t.date) <= endDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return spent / b.amount < 0.9;
  }).length;

  const healthScore =
    budgetsWithData > 0 ? Math.round((onTrack / budgetsWithData) * 100) : 100;

  res.json({
    insights,
    healthScore,
    stats: {
      totalBudgets: budgets.length,
      onTrack,
      overBudget: budgetsWithData - onTrack,
      untracked: unbugdetedSpending.length,
    },
  });
};

// @desc    Get budget history for a category
// @route   GET /api/budgets/:id/history
// @access  Private
export const getBudgetHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget || budget.userId !== userId) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  // Get 6 months of data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      category: budget.category,
      type: "EXPENSE",
      date: { gte: sixMonthsAgo },
    },
    orderBy: { date: "asc" },
  });

  // Group by month
  const monthlyData: { month: string; spent: number; budget: number }[] = [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = months[date.getMonth()];

    const spent = transactions
      .filter((t) => new Date(t.date).toISOString().slice(0, 7) === monthKey)
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: monthName,
      spent,
      budget: budget.amount,
    });
  }

  res.json({
    category: budget.category,
    period: budget.period,
    budgetAmount: budget.amount,
    history: monthlyData,
  });
};
