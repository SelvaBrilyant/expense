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
