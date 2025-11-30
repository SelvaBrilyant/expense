import { create } from 'zustand';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export type SavingCategory = 'EMERGENCY' | 'VACATION' | 'EDUCATION' | 'HOME' | 'CAR' | 'INVESTMENT' | 'RETIREMENT' | 'OTHER';
export type SavingPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Saving {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: SavingCategory;
  priority: SavingPriority;
  deadline?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateSavingInput {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  category: SavingCategory;
  priority: SavingPriority;
  deadline?: string;
  notes?: string;
}

interface UpdateSavingInput {
  title?: string;
  targetAmount?: number;
  currentAmount?: number;
  category?: SavingCategory;
  priority?: SavingPriority;
  deadline?: string;
  notes?: string;
  isCompleted?: boolean;
}

interface SavingsState {
  savings: Saving[];
  isLoading: boolean;
  error: string | null;
  fetchSavings: (filters?: Record<string, string | boolean>) => Promise<void>;
  getSavingById: (id: string) => Promise<Saving | null>;
  createSaving: (saving: CreateSavingInput) => Promise<void>;
  updateSaving: (id: string, saving: UpdateSavingInput) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;
  addToSaving: (id: string, amount: number) => Promise<void>;
  withdrawFromSaving: (id: string, amount: number) => Promise<void>;
}

export const useSavingsStore = create<SavingsState>((set) => ({
  savings: [],
  isLoading: false,
  error: null,

  fetchSavings: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Convert filter values to strings for URLSearchParams
      const stringFilters: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        stringFilters[key] = String(value);
      });
      const params = new URLSearchParams(stringFilters).toString();
      const { data } = await api.get(`/savings?${params}`);
      set({ savings: data, isLoading: false });
    } catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to fetch savings',
        isLoading: false,
      });
    }
  },

  getSavingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/savings/${id}`);
      set({ isLoading: false });
      return data;
    }  catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to fetch saving',
        isLoading: false,
      });
      return null;
    }
  },

  createSaving: async (saving) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/savings', saving);
      set((state) => ({
        savings: [data, ...state.savings],
        isLoading: false,
      }));
    }  catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to create saving',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSaving: async (id, saving) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/savings/${id}`, saving);
      set((state) => ({
        savings: state.savings.map((s) => (s.id === id ? data : s)),
        isLoading: false,
      }));
    }  catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to update saving',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSaving: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/savings/${id}`);
      set((state) => ({
        savings: state.savings.filter((s) => s.id !== id),
        isLoading: false,
      }));
    }  catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to delete saving',
        isLoading: false,
      });
      throw error;
    }
  },

  addToSaving: async (id, amount) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/savings/${id}/add`, { amount });
      set((state) => ({
        savings: state.savings.map((s) => (s.id === id ? data : s)),
        isLoading: false,
      }));
    }  catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to add funds',
        isLoading: false,
      });
      throw error;
    }
  },

  withdrawFromSaving: async (id, amount) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/savings/${id}/withdraw`, { amount });
      set((state) => ({
        savings: state.savings.map((s) => (s.id === id ? data : s)),
        isLoading: false,
      }));
    }  catch (error: unknown) {
          const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Failed to withdraw funds',
        isLoading: false,
      });
      throw error;
    }
  },
}));
