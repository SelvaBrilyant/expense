import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { aiService } from "../services/aiService";

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
      date: "desc",
    },
  });

  try {
    const insights = await aiService.generateInsights(
      (req as any).user,
      transactions
    );
    res.json({ insights });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("AI Service Failed");
  }
};

// @desc    Chat with AI Advisor
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAdvisor = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { message, context } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
    });

    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    const response = await aiService.chatWithAdvisor(message, {
      user,
      transactions,
      budgets,
      context,
    });

    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Chat Failed");
  }
};

// @desc    Get weekly report
// @route   GET /api/ai/weekly-report
// @access  Private
export const getWeeklyReport = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: weekAgo },
      },
      orderBy: { date: "desc" },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    const report = await aiService.getWeeklyReport(user, transactions, budgets);
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Weekly Report Failed");
  }
};

// @desc    Analyze spending patterns
// @route   GET /api/ai/patterns
// @access  Private
export const analyzeSpendingPatterns = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 100,
  });

  try {
    const analysis = await aiService.analyzeSpendingPatterns(
      transactions,
      (req as any).user
    );
    res.json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Pattern Analysis Failed");
  }
};

// @desc    Detect overspending
// @route   GET /api/ai/overspending
// @access  Private
export const detectOverspending = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const budgets = await prisma.budget.findMany({
    where: { userId },
  });

  try {
    const alerts = await aiService.detectOverspending(
      transactions,
      budgets,
      (req as any).user
    );
    res.json({ alerts });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Overspending Detection Failed");
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
    orderBy: { date: "desc" },
  });

  try {
    const advice = await aiService.getCategoryAdvice(
      category,
      transactions,
      (req as any).user
    );
    res.json({ advice });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Category Advice Failed");
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
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
    throw new Error("Recommendations Failed");
  }
};

// @desc    Parse invoice image using AI
// @route   POST /api/ai/parse-invoice
// @access  Private
export const parseInvoice = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded" });
      return;
    }

    // Validate file type (images and PDFs)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        error:
          "Invalid file type. Only images (JPEG, PNG, WebP) and PDF files are allowed",
      });
      return;
    }

    // Convert file buffer to base64
    const base64Data = req.file.buffer.toString("base64");

    // Use AI service to parse the invoice
    const result = await aiService.parseInvoice(base64Data, req.file.mimetype);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: "Invoice parsed successfully",
      });
    } else {
      res.status(422).json({
        success: false,
        error: result.error || "Failed to parse invoice",
      });
    }
  } catch (error: any) {
    console.error("Parse invoice error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to parse invoice",
    });
  }
};

// @desc    Suggest category based on transaction title
// @route   POST /api/ai/suggest-category
// @access  Private
export const suggestCategory = async (req: Request, res: Response) => {
  try {
    const { title, type } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: "Title is required" });
      return;
    }

    const transactionType = type === "INCOME" ? "INCOME" : "EXPENSE";
    const result = await aiService.suggestCategory(title, transactionType);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Suggest category error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to suggest category",
    });
  }
};

// @desc    Predict next month's spending
// @route   GET /api/ai/predict-spending
// @access  Private
export const predictSpending = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Fetch last 6 months of transactions for prediction
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      orderBy: { date: "desc" },
    });

    const result = await aiService.predictSpending(transactions);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Spending prediction error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to predict spending",
    });
  }
};
