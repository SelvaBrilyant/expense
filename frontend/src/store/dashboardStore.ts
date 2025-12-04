import { create } from "zustand";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Transaction } from "./transactionStore";

interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface CategoryStat {
  category: string;
  amount: number;
}

interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

interface DashboardStats {
  count: number;
  incomeCount: number;
  expenseCount: number;
  largestExpense: number;
}

interface BudgetStatus {
  id: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "ON_TRACK" | "WARNING" | "CRITICAL" | "OVER";
}

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  nextDueDate: string;
  frequency: string;
}

interface DashboardData {
  summary: DashboardSummary;
  stats: DashboardStats;
  recentTransactions: Transaction[];
  expenseByCategory: CategoryStat[];
  incomeByCategory: CategoryStat[];
  chartData: ChartDataPoint[];
  budgetStatus: BudgetStatus[];
  upcomingRecurring: RecurringTransaction[];
}

interface DashboardState extends DashboardData {
  previousPeriodData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (startDate: string, endDate: string) => Promise<void>;
  fetchPreviousDashboardData: (
    startDate: string,
    endDate: string
  ) => Promise<void>;
}

const initialData: DashboardData = {
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  },
  stats: {
    count: 0,
    incomeCount: 0,
    expenseCount: 0,
    largestExpense: 0,
  },
  recentTransactions: [],
  expenseByCategory: [],
  incomeByCategory: [],
  chartData: [],
  budgetStatus: [],
  upcomingRecurring: [],
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialData,
  previousPeriodData: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/dashboard", {
        params: { startDate, endDate },
      });

      set({
        ...data,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Failed to fetch dashboard data",
        isLoading: false,
      });
    }
  },

  fetchPreviousDashboardData: async (startDate, endDate) => {
    try {
      const { data } = await api.get("/dashboard", {
        params: { startDate, endDate },
      });

      set({
        previousPeriodData: data,
      });
    } catch (error) {
      console.error("Failed to fetch previous period data", error);
    }
  },
}));
