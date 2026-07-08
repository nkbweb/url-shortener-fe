"use client";

import { useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Loader2,
  Zap,
  Check,
  Globe,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShortUrl, ShortenPayload } from "@/lib/types/url.types";

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

export function ShortenForm({ shorten, isShortenLoading }: { shorten: (payload: ShortenPayload) => Promise<ShortUrl>; isShortenLoading: boolean }) {
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "link";
    }
  };

  const triggerParticleExplosion = (urlStr: string) => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = (canvas.width = canvas.clientWidth);
    const canvasHeight = (canvas.height = canvas.clientHeight);

    const btn = document.getElementById("shorten-submit-btn");
    const btnRect = btn?.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const startX = btnRect
      ? btnRect.left - canvasRect.left + btnRect.width / 2
      : canvasWidth / 2;
    const startY = btnRect
      ? btnRect.top - canvasRect.top + btnRect.height / 2
      : canvasHeight - 30;

    const domain = getDomain(urlStr);
    const favImg = new Image();
    favImg.src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

    const particles: any[] = [];
    const count = 35;

    class ExplodingParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      gravity: number;
      drag: number;
      alpha: number;
      decay: number;
      size: number;
      isImage: boolean;
      color: string;
      rotation: number;
      rotSpeed: number;

      constructor() {
        this.x = startX;
        this.y = startY;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2.5); // shoot upwards
        const speed = Math.random() * 8 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.22;
        this.drag = 0.97;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.size = Math.random() * 4 + 3;
        this.isImage = Math.random() > 0.65; // ~35% favicon textures
        this.color = Math.random() > 0.5 ? "oklch(0.62 0.22 35)" : "oklch(0.78 0.18 65)";
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
      }

      update() {
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.rotation += this.rotSpeed;

        // Bounce physics on canvas edges
        if (this.x < 0 || this.x > canvasWidth) this.vx *= -0.7;
        if (this.y < 0) this.vy *= -0.7;
        // Bounce floor
        if (this.y > canvasHeight) {
          this.y = canvasHeight;
          this.vy *= -0.5;
          this.vx *= 0.8;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.isImage && favImg.complete) {
          const imgSize = 14;
          ctx.drawImage(favImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new ExplodingParticle());
    }

    const runExplosion = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      let alive = false;

      particles.forEach((p) => {
        if (p.alpha > 0) {
          p.update();
          p.draw();
          alive = true;
        }
      });

      if (alive) {
        requestAnimationFrame(runExplosion);
      } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
    };

    runExplosion();
  };

  const onSubmit = async (data: ShortenFormValues) => {
    const result = await shorten({
      originalUrl: data.originalUrl,
      ...(data.shortCode ? { shortCode: data.shortCode } : {}),
    }).catch(() => {});
    
    if (result) {
      triggerParticleExplosion(data.originalUrl);
    }
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      {/* Canvas Explosion Overlay */}
      <canvas
        ref={particleCanvasRef}
        className="pointer-events-none absolute inset-0 z-50 rounded-2xl w-full h-full"
      />

      {/* Form */}
      <form
        id="shorten-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3.5 text-left"
      >
        <div className="flex flex-col sm:flex-row gap-2.5 bg-card/25 backdrop-blur-2xl p-2 rounded-2xl border border-border/40 shadow-lg focus-within:border-primary/45 focus-within:ring-1 focus-within:ring-primary/25 transition-all duration-200">
          {/* URL input */}
          <div className="flex-1 min-w-0 relative flex items-center">
            <Globe className="absolute left-3.5 h-4 w-4 text-muted-foreground/75" />
            <Input
              id="shorten-url-input"
              type="url"
              placeholder="Paste your long link here..."
              {...register("originalUrl")}
              className="pl-10 pr-10 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 w-full text-sm font-medium"
            />
            <div className="absolute right-3">
              {watchedUrl && !errors.originalUrl && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                </motion.span>
              )}
            </div>
          </div>

          {/* Custom code input */}
          <div className="sm:w-44 relative flex items-center border-t sm:border-t-0 sm:border-l border-border/20 pt-2 sm:pt-0 sm:pl-2.5">
            <Hash className="absolute left-3 sm:left-5 h-4 w-4 text-muted-foreground/75" />
            <Input
              id="shorten-code-input"
              type="text"
              placeholder="custom path"
              {...register("shortCode")}
              className="pl-9 sm:pl-11 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 w-full text-sm font-medium"
            />
          </div>

          {/* Submit */}
          <motion.div whileTap={{ scale: 0.97 }} className="shrink-0 pt-1 sm:pt-0">
            <Button
              id="shorten-submit-btn"
              type="submit"
              disabled={isShortenLoading}
              className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 transition-all duration-200 w-full sm:w-auto"
            >
              {isShortenLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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

        {/* Validation Errors */}
        <AnimatePresence>
          {errors.originalUrl && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive font-medium px-4 flex items-center gap-1.5"
            >
              • {errors.originalUrl.message}
            </motion.p>
          )}
          {errors.shortCode && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive font-medium px-4"
            >
              • {errors.shortCode.message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Real-time Social Preview */}
        <SocialPreview watchedUrl={watchedUrl} errors={!!errors.originalUrl} />
      </form>
    </motion.div>
  );
}

import { Eye } from "lucide-react";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.1 15.427 1 12.24 1 6.033 1 1.033 6.033 1.033 12.24S6.033 23.48 12.24 23.48c6.478 0 10.793-4.537 10.793-10.985 0-.746-.08-1.32-.176-1.71H12.24z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function SocialPreview({ watchedUrl, errors }: { watchedUrl: string | undefined; errors: boolean }) {
  const [activeTab, setActiveTab] = useState<"google" | "facebook" | "twitter">("google");

  const isValidUrl = useMemo(() => {
    if (!watchedUrl || errors) return false;
    try {
      let urlToTest = watchedUrl;
      if (!/^https?:\/\//i.test(watchedUrl)) {
        urlToTest = "https://" + watchedUrl;
      }
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  }, [watchedUrl, errors]);

  const previewData = useMemo(() => {
    if (!isValidUrl || !watchedUrl) return null;
    let urlToParse = watchedUrl;
    if (!/^https?:\/\//i.test(watchedUrl)) {
      urlToParse = "https://" + urlToParse;
    }
    try {
      const url = new URL(urlToParse);
      const domain = url.hostname.replace("www.", "");
      const pathname = url.pathname;
      
      const segments = pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      let title = lastSegment 
        ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/[-_]/g, " ")
        : domain.split(".")[0].toUpperCase();
      
      if (title.length > 50) {
        title = title.substring(0, 50) + "…";
      }
      
      const description = `Explore full analytics, stats and links metadata for ${title} on ${domain}. Direct redirects enabled instantly.`;
      
      return { domain, pathname, title, description, url: urlToParse };
    } catch {
      return null;
    }
  }, [watchedUrl, isValidUrl]);

  if (!previewData) return null;

  const { domain, pathname, title, description } = previewData;

  const tabs = [
    { id: "google", label: "Google", icon: GoogleIcon },
    { id: "facebook", label: "Facebook", icon: FacebookIcon },
    { id: "twitter", label: "Twitter / X", icon: TwitterIcon },
  ] as const;


  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 border-t border-border/40 pt-5 space-y-4 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Eye className="h-3.5 w-3.5" />
          <span>Social Share Preview</span>
        </div>
        
        {/* Preview Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/10 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {activeTab === "google" && (
            <motion.div
              key="google"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-1.5 font-sans"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                <span>https://{domain}</span>
                {pathname && (
                  <span className="truncate">
                    {pathname.split("/").filter(Boolean).map((seg) => ` › ${seg}`)}
                  </span>
                )}
              </div>
              <h4 className="text-[#1a0dab] dark:text-sky-400 text-lg font-normal hover:underline cursor-pointer leading-tight">
                {title} — Link Details
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {description}
              </p>
            </motion.div>
          )}

          {activeTab === "facebook" && (
            <motion.div
              key="facebook"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="max-w-md mx-auto border border-border/50 bg-card rounded-xl overflow-hidden shadow-sm"
            >
              {/* FB header */}
              <div className="flex items-center gap-2.5 p-3.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white uppercase">
                  {domain.charAt(0)}
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-foreground">{domain}</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Just now · 🌐</p>
                </div>
              </div>
              {/* FB content image */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex flex-col items-center justify-center p-6 border-y border-border/40 select-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-muted shadow-md border border-border/40 mb-2">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground tracking-wide font-medium">{domain}</span>
              </div>
              {/* FB details footer */}
              <div className="p-3 bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{domain}</span>
                <h4 className="text-xs font-bold text-foreground truncate">{title}</h4>
                <p className="text-[11px] text-muted-foreground leading-normal truncate">{description}</p>
              </div>
            </motion.div>
          )}

          {activeTab === "twitter" && (
            <motion.div
              key="twitter"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="max-w-md mx-auto border border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              {/* Twitter Image card layout */}
              <div className="relative aspect-video bg-gradient-to-tr from-accent/10 via-primary/5 to-accent/5 flex flex-col items-center justify-center p-6 border-b border-border/40 select-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-muted shadow-md border border-border/40 mb-2">
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <span className="font-mono text-xs text-muted-foreground font-medium">{domain}</span>
              </div>
              <div className="p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium">{domain}</span>
                <h4 className="text-xs font-bold text-foreground truncate">{title}</h4>
                <p className="text-[11px] text-muted-foreground leading-normal truncate">{description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

