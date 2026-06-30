"use client";

import { useEffect } from "react";
import { BarChart3, Link2, TrendingUp } from "lucide-react";
import { ShortenForm } from "@/components/urls/ShortenForm";
import { UrlTable } from "@/components/urls/UrlTable";
import { useUrls } from "@/lib/hooks/useUrls";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardPage() {
  const { urls, isLoading, fetchUrls, shorten, deleteUrl } = useUrls();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const totalClicks = urls.reduce((sum, u) => sum + (u.clicks ?? 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Your{" "}
          <span className="text-gradient">Links</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.email
            ? `Logged in as ${user.email}`
            : "Manage and track all your short links"}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Link2 className="h-5 w-5" />}
          label="Total links"
          value={urls.length}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Total clicks"
          value={totalClicks}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg. clicks"
          value={urls.length ? Math.round(totalClicks / urls.length) : 0}
          className="hidden sm:flex"
        />
      </div>

      {/* Shorten form */}
      <ShortenForm />

      {/* URL table */}
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
        <UrlTable urls={urls} isLoading={isLoading} onDelete={deleteUrl} />
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 flex items-center gap-4 animate-slide-up ${className}`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}
