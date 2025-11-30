import { create } from 'zustand';
import api from '@/lib/api';

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: () => Promise<void>;
  addBudget: (budget: any) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/budgets');
      set({ budgets: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch budgets',
        isLoading: false,
      });
    }
  },

  addBudget: async (budget) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/budgets', budget);
      set((state) => ({
        budgets: [...state.budgets, data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to add budget',
        isLoading: false,
      });
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/budgets/${id}`);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete budget',
        isLoading: false,
      });
    }
  },
}));
