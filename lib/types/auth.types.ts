// ============================================================
// Auth types — mirrors Prisma schema + BE contract exactly
// ============================================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
}
