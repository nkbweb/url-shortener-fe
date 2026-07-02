"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link2, MousePointerClick, TrendingUp, Sparkles } from "lucide-react";
import { ShortenForm } from "@/components/urls/ShortenForm";
import { UrlTable } from "@/components/urls/UrlTable";
import { useUrls } from "@/lib/hooks/useUrls";
import { useAuthStore } from "@/lib/stores/authStore";
import { stagger, fadeUp, itemVariants, springUp, staggerSpring } from "@/lib/motion";

export default function DashboardPage() {
  const { urls, isLoading, hasMore, fetchUrls, loadMore, updateUrl, deleteUrl, shorten, isShortenLoading } = useUrls();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const totalClicks = useMemo(
    () => urls.reduce((sum, u) => sum + (u.clicks ?? 0), 0),
    [urls]
  );
  const avgClicks = urls.length ? Math.round(totalClicks / urls.length) : 0;

  const stats = [
    {
      icon: <Link2 className="h-5 w-5" />,
      label: "Total links",
      value: urls.length,
      accent: "from-primary/15 to-accent/10",
      border: "hover:border-primary/30",
    },
    {
      icon: <MousePointerClick className="h-5 w-5" />,
      label: "Total clicks",
      value: totalClicks,
      accent: "from-primary/10 to-primary/5",
      border: "hover:border-primary/30",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Avg. clicks per link",
      value: avgClicks,
      accent: "from-emerald-500/15 to-emerald-500/5",
      border: "hover:border-emerald-500/30",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome banner */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Your{" "}
              <span className="text-gradient">Links</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.email
                ? `Welcome back, ${user.email.split("@")[0]}`
                : "Manage and track all your short links"}
            </p>
          </div>
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={staggerSpring} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.div>

      {/* Shorten form */}
      <motion.div variants={fadeUp}>
        <ShortenForm shorten={shorten} isShortenLoading={isShortenLoading} />
      </motion.div>

      {/* URL table section */}
      <motion.section variants={fadeUp}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            All links
            {urls.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
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
      </motion.section>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  border: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, scale: 1.01, transition: { type: "spring", stiffness: 350, damping: 18 } }}
      whileTap={{ scale: 0.99, transition: { type: "spring", stiffness: 350, damping: 18 } }}
      className={`group relative rounded-2xl border border-border/50 bg-card p-5 ${border}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${accent} opacity-50`}
      />
      <div className="relative flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
