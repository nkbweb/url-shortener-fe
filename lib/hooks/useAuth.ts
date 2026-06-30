"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/stores/authStore";
import type { LoginPayload, RegisterPayload } from "@/lib/types/auth.types";
import { ApiError } from "@/lib/api/client";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        const res = await authApi.register(payload);
        if (res.user) setUser(res.user);
        toast.success("Account created! Please log in.");
        router.push("/login");
      } catch (err: any) {
        toast.error(err.message || "Registration failed");
        throw err;
      }
    },
    [setUser, router]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const res = await authApi.login(payload);
        if (res.user) setUser(res.user);
        toast.success("Welcome back! 👋");
        router.push("/dashboard");
      } catch (err: any) {
        toast.error(err.message || "Login failed");
        throw err;
      }
    },
    [setUser, router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Swallow — cookies still cleared server-side
    } finally {
      clearAuth();
      router.push("/login");
      toast.success("Logged out successfully");
    }
  }, [clearAuth, router]);

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
  };
}
