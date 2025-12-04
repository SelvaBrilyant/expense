import { create } from "zustand";
import api from "@/lib/api";
import { AxiosError } from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  refreshToken?: string;
  profilePicture?: string;
  coverPicture?: string;
  dateOfBirth?: Date | string;
  bio?: string;
  phoneNumber?: string;
  lastLoginAt?: string;
}

interface Session {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
}

interface SecurityLog {
  id: string;
  eventType: string;
  ipAddress: string;
  userAgent: string;
  details: string | null;
  success: boolean;
  createdAt: string;
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

interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  strength: string;
  errors: string[];
  suggestions: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  sessions: Session[];
  securityLogs: SecurityLog[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  googleLogin: (credential: string, reactivate?: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
  reactivateAccount: (credentials: LoginCredentials) => Promise<void>;
  validatePassword: (password: string) => Promise<PasswordValidationResult>;
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  fetchSecurityLogs: () => Promise<void>;
  clearError: () => void;
}

// Helper to store tokens
const storeTokens = (token: string, refreshToken?: string) => {
  localStorage.setItem("token", token);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

// Helper to clear tokens
const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  sessions: [],
  securityLogs: [],

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/users/login", credentials);
      storeTokens(data.token, data.refreshToken);
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage = err.response?.data?.message || "Login failed";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/users", userData);
      storeTokens(data.token, data.refreshToken);
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage = err.response?.data?.message || "Registration failed";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/users/logout", { refreshToken });
    } catch {
      // Continue with local logout even if API call fails
    }
    clearTokens();
    set({ user: null, sessions: [], securityLogs: [] });
  },

  logoutAllDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/users/logout-all");
      clearTokens();
      set({ user: null, sessions: [], securityLogs: [], isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error:
          err.response?.data?.message || "Failed to logout from all devices",
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ isLoading: true, error: null });
      try {
        const { data } = await api.get("/users/profile");
        set({ user: { ...data, token }, isLoading: false });
      } catch {
        clearTokens();
        set({
          user: null,
          error: null,
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
      const { data } = await api.put("/users/profile", userData);
      if (data.token) {
        storeTokens(data.token, data.refreshToken);
      }
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Profile update failed",
        isLoading: false,
      });
      throw new Error(err.response?.data?.message || "Profile update failed");
    }
  },

  googleLogin: async (credential: string, reactivate?: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/users/google", {
        credential,
        reactivate,
      });
      storeTokens(data.token, data.refreshToken);
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Google login failed",
        isLoading: false,
      });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.delete("/users/profile");
      clearTokens();
      set({ user: null, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Account deletion failed",
        isLoading: false,
      });
    }
  },

  reactivateAccount: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/users/reactivate", credentials);
      storeTokens(data.token, data.refreshToken);
      set({ user: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      set({
        error: err.response?.data?.message || "Reactivation failed",
        isLoading: false,
      });
    }
  },

  validatePassword: async (
    password: string
  ): Promise<PasswordValidationResult> => {
    try {
      const { data } = await api.post("/users/validate-password", { password });
      return data;
    } catch {
      return {
        isValid: false,
        score: 0,
        strength: "Unknown",
        errors: ["Failed to validate password"],
        suggestions: [],
      };
    }
  },

  fetchSessions: async () => {
    try {
      const { data } = await api.get("/users/sessions");
      set({ sessions: data });
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  },

  revokeSession: async (sessionId: string) => {
    try {
      await api.delete(`/users/sessions/${sessionId}`);
      // Remove session from local state
      const { sessions } = get();
      set({ sessions: sessions.filter((s) => s.id !== sessionId) });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      throw new Error(
        err.response?.data?.message || "Failed to revoke session"
      );
    }
  },

  fetchSecurityLogs: async () => {
    try {
      const { data } = await api.get("/users/security-logs");
      set({ securityLogs: data });
    } catch (error) {
      console.error("Failed to fetch security logs:", error);
    }
  },

  clearError: () => set({ error: null }),
}));
