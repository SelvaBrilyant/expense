import { create } from 'zustand';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: string;
  isActive: boolean;
}

interface RecurringInput {
  title: string;
  amount: number;
  category: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  notes?: string;
}

interface RecurringState {
  recurringTransactions: RecurringTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchRecurring: () => Promise<void>;
  addRecurring: (recurring: RecurringInput) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set) => ({
  recurringTransactions: [],
  isLoading: false,
  error: null,

  fetchRecurring: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/recurring');
      set({ recurringTransactions: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to fetch recurring transactions',
        isLoading: false,
      });
    }
  },

  addRecurring: async (recurring) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/recurring', recurring);
      set((state) => ({
        recurringTransactions: [...state.recurringTransactions, data],
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to add recurring transaction',
        isLoading: false,
      });
    }
  },

  deleteRecurring: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/recurring/${id}`);
      set((state) => ({
        recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to delete recurring transaction',
        isLoading: false,
      });
    }
  },
}));
