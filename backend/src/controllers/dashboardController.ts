import { Request, Response } from "express";
import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

// @desc    Get dashboard data (totals, recent transactions, charts)
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const userId = (req as any).user.id;

  // Build date filter
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate as string);
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate as string);
  }

  const where = {
    userId,
    ...(startDate || endDate ? { date: dateFilter } : {}),
  };

  try {
    // 1. Calculate Totals (Income, Expense, Balance)
    const totals = await prisma.transaction.groupBy({
      by: ["type"],
      where,
      _sum: {
        amount: true,
      },
    });

    const totalIncome =
      totals.find((t) => t.type === TransactionType.INCOME)?._sum.amount || 0;
    const totalExpense =
      totals.find((t) => t.type === TransactionType.EXPENSE)?._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    // 2. Get Recent Transactions (Limit 5)
    const recentTransactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      take: 5,
      include: {
        items: true,
      },
    });

    // 3. Get Expense by Category (for Pie Chart)
    const expenseByCategory = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        ...where,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    // 4. Get Income by Category (Optional, but good to have)
    const incomeByCategory = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        ...where,
        type: TransactionType.INCOME,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    // 5. Daily Activity (for Line/Bar Chart) - Aggregated by Date
    // Prisma doesn't support grouping by date part easily across all DBs,
    // so we'll fetch lightweight data and aggregate in JS or use raw query.
    // For simplicity and safety, let's fetch necessary fields and aggregate in JS.
    // If dataset is huge, raw query is better, but for personal finance, this is usually fine.
    const allTransactionsForChart = await prisma.transaction.findMany({
      where,
      select: {
        date: true,
        amount: true,
        type: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Aggregate by date (YYYY-MM-DD)
    const dailyStats = allTransactionsForChart.reduce((acc: any, curr) => {
      const dateStr = curr.date.toISOString().split("T")[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
      }
      if (curr.type === TransactionType.INCOME) {
        acc[dateStr].income += curr.amount;
      } else {
        acc[dateStr].expense += curr.amount;
      }
      return acc;
    }, {});

    const chartData = Object.values(dailyStats);

    // 6. Get Additional Stats (Count, Largest Expense)
    const counts = await prisma.transaction.groupBy({
      by: ["type"],
      where,
      _count: {
        id: true,
      },
    });

    const incomeCount =
      counts.find((c) => c.type === TransactionType.INCOME)?._count.id || 0;
    const expenseCount =
      counts.find((c) => c.type === TransactionType.EXPENSE)?._count.id || 0;

    const maxExpense = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: TransactionType.EXPENSE,
      },
      _max: {
        amount: true,
      },
    });

    // 7. Get Budget Status
    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId,
            category: budget.category,
            type: TransactionType.EXPENSE,
            date: dateFilter, // Use the same date filter as the dashboard
          },
          _sum: {
            amount: true,
          },
        });

        const totalSpent = spent._sum.amount || 0;
        const percentage = (totalSpent / budget.amount) * 100;

        return {
          ...budget,
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentage,
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

    // 8. Get Upcoming Recurring Transactions
    const upcomingRecurring = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextDueDate: {
          gte: new Date(), // Future dates only
        },
      },
      orderBy: {
        nextDueDate: "asc",
      },
      take: 5,
    });

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance,
      },
      stats: {
        count: incomeCount + expenseCount,
        incomeCount,
        expenseCount,
        largestExpense: maxExpense._max.amount || 0,
      },
      recentTransactions,
      expenseByCategory: expenseByCategory.map((item) => ({
        category: item.category,
        amount: item._sum.amount || 0,
      })),
      incomeByCategory: incomeByCategory.map((item) => ({
        category: item.category,
        amount: item._sum.amount || 0,
      })),
      chartData,
      budgetStatus: budgetStatus
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 4), // Top 4 critical budgets
      upcomingRecurring,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error fetching dashboard data" });
  }
};
