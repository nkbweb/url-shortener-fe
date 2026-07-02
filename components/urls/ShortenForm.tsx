"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
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
    await shorten({
      originalUrl: data.originalUrl,
      ...(data.shortCode ? { shortCode: data.shortCode } : {}),
    }).catch(() => {});
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
    >
      {/* Accent stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/60" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
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
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* URL input */}
            <div className="flex-1 space-y-1">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {watchedUrl && !errors.originalUrl && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                    </motion.span>
                  )}
                </div>
                <Input
                  id="shorten-url-input"
                  type="url"
                  placeholder="https://very-long-url.com/with/a/long/path"
                  {...register("originalUrl")}
                  className={`pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all ${
                    watchedUrl && !errors.originalUrl
                      ? "border-emerald-500/50 focus:border-emerald-500"
                      : ""
                  }`}
                />
              </div>
              {errors.originalUrl && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  {errors.originalUrl.message}
                </motion.p>
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
                  className="pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
                />
              </div>
              {errors.shortCode && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive"
                >
                  {errors.shortCode.message}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <motion.div whileTap={{ scale: 0.97 }} className="shrink-0">
              <Button
                id="shorten-submit-btn"
                type="submit"
                disabled={isShortenLoading}
                className="h-11 px-6 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 whitespace-nowrap transition-all duration-200 w-full sm:w-auto"
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
            </motion.div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
