import { apiClient } from "./client";
import type {
  ShortUrl,
  ShortenPayload,
  DeleteUrlResponse,
} from "@/lib/types/url.types";

/**
 * URL API — calls Next.js /api/url/* proxy route handlers.
 * Auth token forwarded automatically via httpOnly cookies.
 */
export const urlApi = {
  /** POST /api/url → /url/shorten */
  shorten: (payload: ShortenPayload) =>
    apiClient.post<ShortUrl>("/api/url", payload),

  /** GET /api/url → /url */
  getAll: () => apiClient.get<ShortUrl[]>("/api/url"),

  /** DELETE /api/url/:id → /url/:id */
  delete: (id: string) =>
    apiClient.delete<DeleteUrlResponse>(`/api/url/${id}`),
};

/**
 * Redirect to short URL — this goes directly to the BE (302 redirect).
 * Build the full BE redirect URL for use in <a href> or router.push.
 */
export function getRedirectUrl(shortCode: string): string {
  // In browser context the redirect is handled by BE directly
  return `http://localhost:3000/url/${shortCode}`;
}
