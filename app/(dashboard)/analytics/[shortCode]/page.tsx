"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  MousePointerClick,
  Globe,
  Monitor,
  ExternalLink,
  Calendar,
  Loader2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { urlApi } from "@/lib/api/url.api";
import type { UrlAnalyticsResponse } from "@/lib/types/url.types";
import { stagger, fadeUp, itemVariants, staggerSpring } from "@/lib/motion";

export default function AnalyticsPage() {
  const params = useParams<{ shortCode: string }>();
  const router = useRouter();
  const [data, setData] = useState<UrlAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.shortCode) return;
    setLoading(true);
    urlApi
      .getAnalytics(params.shortCode)
      .then((res) => {
        const resolved = (res as { url?: UrlAnalyticsResponse["url"]; analytics?: UrlAnalyticsResponse["analytics"] }).url
          ? (res as unknown as UrlAnalyticsResponse)
          : ((res as { data?: UrlAnalyticsResponse }).data ?? null);
        setData(resolved);
      })
      .catch((err) => {
        setError(err.message || "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, [params.shortCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card p-12 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <BarChart3 className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-base font-semibold text-foreground">Analytics not found</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          {error || "This link does not exist or has no analytics data yet."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to dashboard
        </Link>
      </motion.div>
    );
  }

  const { url, analytics } = data;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header banner */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted/50 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Analytics for{" "}
                <span className="font-mono text-primary">/{url.shortCode}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground truncate max-w-lg">
                {url.originalUrl}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={staggerSpring} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AnalyticsStatCard
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Total clicks"
          value={analytics.total}
          accent="from-primary/15 to-accent/10"
        />
        <AnalyticsStatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Last 7 days"
          value={analytics.last7Days}
          accent="from-emerald-500/15 to-emerald-500/5"
        />
        <AnalyticsStatCard
          icon={<Globe className="h-5 w-5" />}
          label="Referrers"
          value={analytics.referrers.length}
          accent="from-blue-500/15 to-indigo-500/5"
        />
        <AnalyticsStatCard
          icon={<Monitor className="h-5 w-5" />}
          label="Browsers"
          value={analytics.browsers.length}
          accent="from-purple-500/15 to-pink-500/5"
        />
      </motion.div>

      {/* Clicks by day chart */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Clicks over time (30 days)
        </h3>
        {analytics.clicksByDay.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No clicks recorded yet
          </p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {analytics.clicksByDay.slice(-30).map((day, i) => {
              const max = Math.max(...analytics.clicksByDay.map((d) => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: i * 0.02, duration: 0.3, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ delay: i * 0.02, duration: 0.4, ease: "easeOut" }}
                    className="w-full rounded-sm bg-gradient-to-t from-primary to-primary/60 transition-all duration-200 hover:opacity-80 min-h-[4px]"
                  />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {day.date}: {day.count} clicks
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Referrers & Browsers */}
      <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-6">
        {/* Referrers */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Top Referrers
          </h3>
          {analytics.referrers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No referrer data
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.referrers.slice(0, 8).map((ref) => {
                const maxRef = analytics.referrers[0]?.count || 1;
                const pct = Math.round((ref.count / analytics.total) * 100);
                return (
                  <div key={ref.source}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground truncate max-w-[70%]">
                        {ref.source === "" ? (
                          <span className="italic text-muted-foreground">Direct / Unknown</span>
                        ) : (
                          ref.source
                        )}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {ref.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                        style={{ width: `${(ref.count / maxRef) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Browsers */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Browsers
          </h3>
          {analytics.browsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No browser data
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.browsers.slice(0, 8).map((b) => {
                const maxBrowser = analytics.browsers[0]?.count || 1;
                const pct = Math.round((b.count / analytics.total) * 100);
                return (
                  <div key={b.browser}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">{b.browser}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {b.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60"
                        style={{ width: `${(b.count / maxBrowser) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function AnalyticsStatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, scale: 1.01, transition: { type: "spring", stiffness: 350, damping: 18 } }}
      whileTap={{ scale: 0.99, transition: { type: "spring", stiffness: 350, damping: 18 } }}
      className="group relative rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${accent} opacity-50`}
      />
      <div className="relative">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 transition-colors duration-200 group-hover:bg-primary/15">
          {icon}
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}
