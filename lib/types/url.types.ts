export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl?: string;
  clicks: number;
  createdAt: string;
  userId: string | null;
}

export interface ShortenPayload {
  originalUrl: string;
  shortCode?: string;
}

export interface PaginatedUrls {
  urls: ShortUrl[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AnalyticsData {
  total: number;
  last7Days: number;
  clicksByDay: { date: string; count: number }[];
  referrers: { source: string; count: number }[];
  browsers: { browser: string; count: number }[];
}

export interface UrlAnalyticsResponse {
  url: ShortUrl;
  analytics: AnalyticsData;
}

export interface UpdateUrlPayload {
  originalUrl?: string;
  shortCode?: string;
}

export interface DeleteUrlResponse {
  message: string;
}
