"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Link2,
  Hash,
  Loader2,
  Zap,
  Check,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUrls } from "@/lib/hooks/useUrls";

const shortenSchema = z.object({
  originalUrl: z
    .string()
    .url("Enter a valid URL (include https://)"),
  shortCode: z
    .string()
    .min(3, "Min 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, _ and - allowed")
    .optional()
    .or(z.literal("")),
});

type ShortenFormValues = z.infer<typeof shortenSchema>;

export function ShortenForm() {
  const { shorten, isShortenLoading } = useUrls();
  const [urlPreview, setUrlPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ShortenFormValues>({
    resolver: zodResolver(shortenSchema),
  });

  const watchedUrl = watch("originalUrl");

  const onSubmit = async (data: ShortenFormValues) => {
    const result = await shorten({
      originalUrl: data.originalUrl,
      ...(data.shortCode ? { shortCode: data.shortCode } : {}),
    }).catch(() => {});
    reset();
    setUrlPreview(null);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-md shadow-primary/25">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Shorten a URL
          </h2>
          <p className="text-xs text-muted-foreground">
            Paste a long URL and get a short link in seconds
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        id="shorten-form"
        onSubmit={handleSubmit(onSubmit)}
        className="px-6 pb-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* URL input */}
          <div className="flex-1 space-y-1">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {watchedUrl && !errors.originalUrl && (
                  <Check className="h-4 w-4 text-emerald-500 animate-scale-in" />
                )}
              </div>
              <Input
                id="shorten-url-input"
                type="url"
                placeholder="https://very-long-url.com/with/a/long/path"
                {...register("originalUrl")}
                className={`pl-9 h-11 rounded-xl bg-muted/40 border-border/60 focus:border-primary transition-all ${
                  watchedUrl && !errors.originalUrl
                    ? "border-emerald-500/50 focus:border-emerald-500"
                    : ""
                }`}
              />
            </div>
            {errors.originalUrl && (
              <p className="text-xs text-destructive flex items-center gap-1 animate-slide-up">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          {/* Custom code input */}
          <div className="sm:w-44 space-y-1">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="shorten-code-input"
                type="text"
                placeholder="custom (optional)"
                {...register("shortCode")}
                className="pl-9 h-11 rounded-xl bg-muted/40 border-border/60 focus:border-primary transition-all"
              />
            </div>
            {errors.shortCode && (
              <p className="text-xs text-destructive animate-slide-up">
                {errors.shortCode.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            id="shorten-submit-btn"
            type="submit"
            disabled={isShortenLoading}
            className="h-11 px-6 rounded-xl font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap transition-all duration-200 shrink-0"
          >
            {isShortenLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Shortening…
              </>
            ) : (
              <>
                Shorten
                <Zap className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
