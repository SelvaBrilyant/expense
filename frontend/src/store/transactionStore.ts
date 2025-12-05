import { create } from "zustand";
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  paymentMethod: string;
  date: string;
  notes?: string;
  tags?: string[];
  invoiceUrl?: string;
  items?: TransactionItem[];
}

interface TransactionInput {
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  paymentMethod: string;
  date: string;
  notes?: string;
  tags?: string[];
  invoiceUrl?: string;
  items?: TransactionItem[];
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (filters?: Record<string, string>) => Promise<void>;
  addTransaction: (transaction: TransactionInput) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<TransactionInput>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/transactions?${params}`);
      set({ transactions: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Failed to fetch transactions",
        isLoading: false,
      });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/transactions", transaction);
      set((state) => ({
        transactions: [data, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Failed to add transaction",
        isLoading: false,
      });
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/transactions/${id}`, transaction);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? data : t)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Failed to update transaction",
        isLoading: false,
      });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Failed to delete transaction",
        isLoading: false,
      });
    }
  },
}));
