import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/aiService';

const prisma = new PrismaClient();

// @desc    Generate AI Insights
// @route   POST /api/ai/insights
// @access  Private
export const getInsights = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  // Fetch last 90 days transactions
  const date = new Date();
  date.setDate(date.getDate() - 90);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: date,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  try {
    const insights = await aiService.generateInsights((req as any).user, transactions);
    res.json({ insights });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('AI Service Failed');
  }
};

// @desc    Analyze spending patterns
// @route   GET /api/ai/patterns
// @access  Private
export const analyzeSpendingPatterns = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100,
  });

  try {
    const analysis = await aiService.analyzeSpendingPatterns(transactions, (req as any).user);
    res.json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Pattern Analysis Failed');
  }
};

// @desc    Detect overspending
// @route   GET /api/ai/overspending
// @access  Private
export const detectOverspending = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const budgets = await prisma.budget.findMany({
    where: { userId },
  });

  try {
    const alerts = await aiService.detectOverspending(transactions, budgets, (req as any).user);
    res.json({ alerts });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Overspending Detection Failed');
  }
};

// @desc    Get category-specific advice
// @route   GET /api/ai/category/:category
// @access  Private
export const getCategoryAdvice = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { category } = req.params;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  try {
    const advice = await aiService.getCategoryAdvice(category, transactions, (req as any).user);
    res.json({ advice });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Category Advice Failed');
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 50,
  });

  try {
    const recommendations = await aiService.getPersonalizedRecommendations(
      (req as any).user,
      recentTransactions
    );
    res.json({ recommendations });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Recommendations Failed');
  }
};
