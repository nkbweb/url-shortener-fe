"use client";

import { useEffect, useMemo } from "react";
import { Link2, MousePointerClick, TrendingUp } from "lucide-react";
import { ShortenForm } from "@/components/urls/ShortenForm";
import { UrlTable } from "@/components/urls/UrlTable";
import { useUrls } from "@/lib/hooks/useUrls";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardPage() {
  const { urls, isLoading, hasMore, fetchUrls, loadMore, shorten, updateUrl, deleteUrl } = useUrls();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const totalClicks = useMemo(
    () => urls.reduce((sum, u) => sum + (u.clicks ?? 0), 0),
    [urls]
  );
  const avgClicks = urls.length ? Math.round(totalClicks / urls.length) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your{" "}
            <span className="text-gradient">Links</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.email
              ? `Welcome back, ${user.email.split("@")[0]}`
              : "Manage and track all your short links"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Link2 className="h-5 w-5" />}
          label="Total links"
          value={urls.length}
          gradient="from-orange-500/20 to-amber-500/10"
          delay={0}
        />
        <StatCard
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Total clicks"
          value={totalClicks}
          gradient="from-primary/20 to-orange-500/10"
          delay={100}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg. clicks per link"
          value={avgClicks}
          gradient="from-emerald-500/20 to-teal-500/10"
          delay={200}
        />
      </div>

      <ShortenForm />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            All links
            {urls.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary font-bold">
                {urls.length}
              </span>
            )}
          </h2>
        </div>
        <UrlTable
          urls={urls}
          isLoading={isLoading}
          hasMore={hasMore}
          onEdit={updateUrl}
          onDelete={deleteUrl}
          onLoadMore={loadMore}
        />
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className="glass-card relative rounded-2xl p-5 animate-slide-up overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`}
      />
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/80 border border-border/40 shadow-sm">
          <span className="text-primary">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
