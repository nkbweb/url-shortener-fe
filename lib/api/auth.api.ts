import { apiClient } from "./client";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "@/lib/types/auth.types";

/**
 * Auth API — calls Next.js /api/auth/* proxy route handlers.
 * Tokens are managed server-side in httpOnly cookies.
 * The browser only ever receives the `user` object.
 */
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<Pick<AuthResponse, "user" | "message">>(
      "/api/auth/register",
      payload
    ),

  login: (payload: LoginPayload) =>
    apiClient.post<Pick<AuthResponse, "user" | "message">>(
      "/api/auth/login",
      payload
    ),

  refresh: () =>
    apiClient.post<{ message: string }>("/api/auth/refresh"),

  logout: () =>
    apiClient.post<{ message: string }>("/api/auth/logout"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>("/api/auth/reset-password", { token, newPassword }),
};
