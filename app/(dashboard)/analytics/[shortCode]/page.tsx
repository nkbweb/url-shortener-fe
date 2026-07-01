"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  MousePointerClick,
  Globe,
  Monitor,
  ExternalLink,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { urlApi } from "@/lib/api/url.api";
import type { UrlAnalyticsResponse } from "@/lib/types/url.types";

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
      <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
        <p className="text-muted-foreground">{error || "Analytics not found"}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const { url, analytics } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 rounded-xl text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics for{" "}
            <span className="font-mono text-primary">/{url.shortCode}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground truncate max-w-lg">
            {url.originalUrl}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AnalyticsStatCard
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Total clicks"
          value={analytics.total}
          gradient="from-primary/20 to-orange-500/10"
        />
        <AnalyticsStatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Last 7 days"
          value={analytics.last7Days}
          gradient="from-emerald-500/20 to-teal-500/10"
        />
        <AnalyticsStatCard
          icon={<Globe className="h-5 w-5" />}
          label="Referrers"
          value={analytics.referrers.length}
          gradient="from-blue-500/20 to-indigo-500/10"
        />
        <AnalyticsStatCard
          icon={<Monitor className="h-5 w-5" />}
          label="Browsers"
          value={analytics.browsers.length}
          gradient="from-purple-500/20 to-pink-500/10"
        />
      </div>

      {/* Clicks by day chart */}
      <div className="glass-card rounded-2xl p-6">
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
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <div
                    className="w-full rounded-sm bg-gradient-to-t from-primary to-orange-400 transition-all duration-200 hover:opacity-80 min-h-[4px]"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {day.date}: {day.count} clicks
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Referrers & Browsers */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Referrers */}
        <div className="glass-card rounded-2xl p-6">
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
                        className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
                        style={{ width: `${(ref.count / maxRef) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browsers */}
        <div className="glass-card rounded-2xl p-6">
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
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(b.count / maxBrowser) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyticsStatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="glass-card relative rounded-2xl p-5 animate-slide-up overflow-hidden">
      <div aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 border border-border/40 shadow-sm mb-3">
          <span className="text-primary">{icon}</span>
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}
