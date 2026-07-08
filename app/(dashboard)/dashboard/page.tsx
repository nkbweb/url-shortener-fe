"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link2, MousePointerClick, TrendingUp, Sparkles } from "lucide-react";
import { ShortenForm } from "@/components/urls/ShortenForm";
import { UrlTable } from "@/components/urls/UrlTable";
import { useUrls } from "@/lib/hooks/useUrls";
import { useAuthStore } from "@/lib/stores/authStore";
import { stagger, fadeUp, itemVariants, springUp, staggerSpring } from "@/lib/motion";

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return mousePosition;
}

export default function DashboardPage() {
  const { urls, isLoading, hasMore, fetchUrls, loadMore, updateUrl, deleteUrl, shorten, isShortenLoading } = useUrls();
  const user = useAuthStore((s) => s.user);
  const { x, y } = useMousePosition();

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const totalClicks = useMemo(
    () => urls.reduce((sum, u) => sum + (u.clicks ?? 0), 0),
    [urls]
  );
  const avgClicks = urls.length ? Math.round(totalClicks / urls.length) : 0;

  // Dynamic Sparkline trend datasets based on current numbers
  const totalLinksSpark = useMemo(() => {
    const len = urls.length;
    return [Math.round(len * 0.4), Math.round(len * 0.6), Math.round(len * 0.5), Math.round(len * 0.8), Math.round(len * 0.7), len];
  }, [urls.length]);
  
  const totalClicksSpark = useMemo(() => {
    const len = totalClicks;
    return [Math.round(len * 0.2), Math.round(len * 0.5), Math.round(len * 0.4), Math.round(len * 0.8), Math.round(len * 0.6), len];
  }, [totalClicks]);

  const avgClicksSpark = useMemo(() => {
    const len = avgClicks;
    return [Math.round(len * 0.3), Math.round(len * 0.6), Math.round(len * 0.4), Math.round(len * 0.9), Math.round(len * 0.7), len];
  }, [avgClicks]);

  const stats = [
    {
      icon: <Link2 className="h-5 w-5" />,
      label: "Total links",
      value: urls.length,
      accent: "from-primary/15 to-accent/10",
      border: "hover:border-primary/30",
      sparkline: totalLinksSpark,
      color: "var(--primary)",
    },
    {
      icon: <MousePointerClick className="h-5 w-5" />,
      label: "Total clicks",
      value: totalClicks,
      accent: "from-primary/10 to-primary/5",
      border: "hover:border-primary/30",
      sparkline: totalClicksSpark,
      color: "oklch(0.78 0.18 65)", // amber
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Avg. clicks per link",
      value: avgClicks,
      accent: "from-emerald-500/15 to-emerald-500/5",
      border: "hover:border-emerald-500/30",
      sparkline: avgClicksSpark,
      color: "oklch(0.62 0.18 140)", // emerald green
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative"
    >
      {/* Dynamic Cursor tracking mesh glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 opacity-15 dark:opacity-20 blur-[130px] transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(circle 350px at ${x}px ${y}px, var(--primary), transparent)`,
        }}
      />

      {/* Welcome HUD & Shorten Form */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl glass-morph p-6 sm:p-10 text-center space-y-6 shadow-xl"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Your <span className="text-gradient">Links</span>, Amplified
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {user?.email
              ? `Welcome back, ${user.email.split("@")[0]}. Shorten URLs and track real-time analytics.`
              : "Shorten and track your links with state-of-the-art telemetry."}
          </p>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <ShortenForm shorten={shorten} isShortenLoading={isShortenLoading} />
        </div>
      </motion.div>

      {/* Stats Ribbon */}
      <motion.div
        variants={staggerSpring}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl glass-morph p-5 sm:p-6 shadow-md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex items-center justify-between gap-4 ${
                idx > 0 ? "sm:pl-6 pt-4 sm:pt-0" : ""
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
              <div className="shrink-0 pr-2">
                <Sparkline data={stat.sparkline} color={stat.color} />
              </div>
            </div>
          ))}
        </div>
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
          onEdit={updateUrl}
          onDelete={deleteUrl}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </motion.section>
    </motion.div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 76;
  const height = 30;
  
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-70 hover:opacity-100 transition-opacity">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

