"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { urlApi } from "@/lib/api/url.api";
import type { ShortUrl, ShortenPayload, PaginatedUrls, UpdateUrlPayload } from "@/lib/types/url.types";
import { ApiError } from "@/lib/api/client";

export function useUrls() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShortenLoading, setIsShortenLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchUrls = useCallback(async (cursor?: string) => {
    setIsLoading(true);
    try {
      const data = await urlApi.getAll(cursor);
      if (cursor) {
        setUrls((prev) => [...prev, ...data.urls]);
      } else {
        setUrls(data.urls);
      }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load URLs";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (nextCursor && !isLoading) {
      await fetchUrls(nextCursor);
    }
  }, [nextCursor, isLoading, fetchUrls]);

  const shorten = useCallback(async (payload: ShortenPayload) => {
    setIsShortenLoading(true);
    try {
      const newUrl = await urlApi.shorten(payload);
      const url: ShortUrl = (newUrl as { url?: ShortUrl }).url ?? newUrl;
      setUrls((prev) => [url, ...prev]);
      toast.success("Short URL created!");
      return url;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to shorten URL";
      toast.error(message);
      throw err;
    } finally {
      setIsShortenLoading(false);
    }
  }, []);

  const updateUrl = useCallback(async (id: string, payload: UpdateUrlPayload) => {
    try {
      const result = await urlApi.update(id, payload);
      const updated: ShortUrl = (result as { url?: ShortUrl; data?: ShortUrl }).data ?? result;
      setUrls((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      toast.success("URL updated");
      return updated;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to update URL";
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteUrl = useCallback(async (id: string) => {
    try {
      await urlApi.delete(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      toast.success("URL deleted");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete URL";
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    urls,
    isLoading,
    hasMore,
    isShortenLoading,
    fetchUrls,
    loadMore,
    shorten,
    updateUrl,
    deleteUrl,
    setUrls,
  };
}
