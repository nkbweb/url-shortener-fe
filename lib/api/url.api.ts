import { apiClient } from "./client";
import type {
  ShortUrl,
  ShortenPayload,
  PaginatedUrls,
  UrlAnalyticsResponse,
  UpdateUrlPayload,
  DeleteUrlResponse,
} from "@/lib/types/url.types";

export const urlApi = {
  shorten: (payload: ShortenPayload) =>
    apiClient.post<ShortUrl>("/api/url", payload),

  getAll: (cursor?: string, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    params.set("limit", String(limit));
    return apiClient.get<PaginatedUrls>(`/api/url?${params}`);
  },

  getAnalytics: (shortCode: string) =>
    apiClient.get<UrlAnalyticsResponse>(`/api/analytics/${shortCode}`),

  update: (id: string, payload: UpdateUrlPayload) =>
    apiClient.patch<ShortUrl>(`/api/url/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<DeleteUrlResponse>(`/api/url/${id}`),
};

export function getRedirectUrl(shortCode: string): string {
  return `http://localhost:3000/url/${shortCode}`;
}
