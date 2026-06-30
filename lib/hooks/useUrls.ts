"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { urlApi } from "@/lib/api/url.api";
import type { ShortUrl, ShortenPayload } from "@/lib/types/url.types";
import { ApiError } from "@/lib/api/client";

export function useUrls() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShortenLoading, setIsShortenLoading] = useState(false);

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await urlApi.getAll();
      // Handle both array response and wrapped { urls: [] } shape
      const list = Array.isArray(data)
        ? data
        : ((data as { urls?: ShortUrl[] }).urls ?? []);
      setUrls(list);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load URLs";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shorten = useCallback(async (payload: ShortenPayload) => {
    setIsShortenLoading(true);
    try {
      const newUrl = await urlApi.shorten(payload);
      // Handle both direct ShortUrl or wrapped shape
      const url: ShortUrl = (newUrl as { url?: ShortUrl }).url ?? newUrl;
      setUrls((prev) => [url, ...prev]);
      toast.success("Short URL created! 🔗");
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
    isShortenLoading,
    fetchUrls,
    shorten,
    deleteUrl,
  };
}
