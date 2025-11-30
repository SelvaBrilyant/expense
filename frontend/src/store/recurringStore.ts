import { create } from 'zustand';
import api from '@/lib/api';

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: string;
  isActive: boolean;
}

interface RecurringState {
  recurring: RecurringTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchRecurring: () => Promise<void>;
  addRecurring: (recurring: any) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set) => ({
  recurring: [],
  isLoading: false,
  error: null,

  fetchRecurring: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/recurring'); // Need to implement this route if not done
      set({ recurring: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch recurring transactions',
        isLoading: false,
      });
    }
  },

  addRecurring: async (recurring) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/recurring', recurring);
      set((state) => ({
        recurring: [...state.recurring, data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to add recurring transaction',
        isLoading: false,
      });
    }
  },

  deleteRecurring: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/recurring/${id}`);
      set((state) => ({
        recurring: state.recurring.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete recurring transaction',
        isLoading: false,
      });
    }
  },
}));
