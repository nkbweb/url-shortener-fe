import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
    }
  )
);
