// ============================================================
// URL types — mirrors Prisma Url model + BE contract exactly
// ============================================================

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  userId: string | null;
}

export interface ShortenPayload {
  originalUrl: string;
  shortCode?: string; // optional custom short code
}

export interface ShortenResponse {
  // BE returns 201 — shape may vary; cover common patterns
  id?: string;
  originalUrl?: string;
  shortCode?: string;
  clicks?: number;
  createdAt?: string;
  userId?: string | null;
  // Some BEs wrap in a key:
  url?: ShortUrl;
  message?: string;
}

export interface GetAllUrlsResponse {
  // GET /url — array or wrapped object
  urls?: ShortUrl[];
  data?: ShortUrl[];
}

export interface DeleteUrlResponse {
  message: string;
}
