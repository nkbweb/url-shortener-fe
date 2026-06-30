"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2, Hash, Loader2, Zap } from "lucide-react";
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
    formState: { errors },
  } = useForm<ShortenFormValues>({
    resolver: zodResolver(shortenSchema),
  });

  const onSubmit = async (data: ShortenFormValues) => {
    await shorten({
      originalUrl: data.originalUrl,
      ...(data.shortCode ? { shortCode: data.shortCode } : {}),
    }).catch(() => {});
    reset();
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Shorten a URL
        </h2>
      </div>

      <form
        id="shorten-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* URL input */}
          <div className="flex-1 space-y-1">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="shorten-url-input"
                type="url"
                placeholder="https://very-long-url.com/with/a/long/path"
                {...register("originalUrl")}
                className="pl-9 h-11 rounded-xl bg-muted/40 border-border/60 focus:border-primary transition-all"
              />
            </div>
            {errors.originalUrl && (
              <p className="text-xs text-destructive">
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
                placeholder="custom-code"
                {...register("shortCode")}
                className="pl-9 h-11 rounded-xl bg-muted/40 border-border/60 focus:border-primary transition-all"
              />
            </div>
            {errors.shortCode && (
              <p className="text-xs text-destructive">
                {errors.shortCode.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            id="shorten-submit-btn"
            type="submit"
            disabled={isShortenLoading}
            className="h-11 px-6 rounded-xl font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap transition-all duration-200"
          >
            {isShortenLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Shorten →"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
