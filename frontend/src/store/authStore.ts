import { create } from 'zustand';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  profilePicture?: string;
  coverPicture?: string;
  dateOfBirth?: Date | string;
  bio?: string;
  phoneNumber?: string;
}

interface LoginCredentials {
  email: string;
  password?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  coverPicture?: string;
  dateOfBirth?: Date | string;
  bio?: string;
  phoneNumber?: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
  coverPicture?: string;
  dateOfBirth?: Date | string;
  bio?: string;
  phoneNumber?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/users/login', credentials);
      localStorage.setItem('token', data.token);
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false,
      });
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/users', userData);
      localStorage.setItem('token', data.token);
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ isLoading: true, error: null });
      try {
        const { data } = await api.get('/users/profile');
        set({ user: data, isLoading: false });
      } catch {
        localStorage.removeItem('token');
        set({
          user: null,
          error: null, // Don't show error on initial load if token is invalid, just logout
          isLoading: false,
        });
      }
    } else {
      set({ user: null, isLoading: false });
    }
  },

  updateProfile: async (userData: UpdateProfileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put('/users/profile', userData);
      // Update local storage token if it changed (though usually it doesn't on profile update unless password changed)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || 'Profile update failed',
        isLoading: false,
      });
    }
  },
}));
