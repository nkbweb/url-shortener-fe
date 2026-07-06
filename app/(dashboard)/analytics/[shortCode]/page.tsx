"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Smartphone,
  Laptop,
  Tablet,
  Terminal,
  Apple,
  Share2,
  Activity,
  Compass,
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
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(30);

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

  // Filter clicks over time based on date range
  const filteredClicksByDay = useMemo(() => {
    if (!data?.analytics.clicksByDay) return [];
    return data.analytics.clicksByDay.slice(-dateRange);
  }, [data, dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Gathering link insights…</p>
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

  // Prepare fallback data for new fields in case backend fields are empty
  const devices = analytics.devices || [];
  const os = analytics.os || [];

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
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/10 blur-3xl"
        />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted/50 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate flex items-center gap-2">
                Analytics for{" "}
                <span className="font-mono text-primary truncate">/{url.shortCode}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground truncate max-w-md sm:max-w-xl">
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
          icon={<Compass className="h-5 w-5" />}
          label="Browsers"
          value={analytics.browsers.length}
          accent="from-purple-500/15 to-pink-500/5"
        />
      </motion.div>

      {/* Interactive SVG Chart Card */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Clicks Trend
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Visualizing clicks over selected interval</p>
          </div>
          
          {/* Timeframe selector tabs */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 self-start">
            {([
              { label: "7 days", value: 7 },
              { label: "14 days", value: 14 },
              { label: "30 days", value: 30 },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateRange === opt.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredClicksByDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-8 w-8 opacity-40 mb-2 stroke-1" />
            <p className="text-sm">No click trend data for this period</p>
          </div>
        ) : (
          <InteractiveAreaChart data={filteredClicksByDay} />
        )}
      </motion.div>

      {/* Traffic Sonar & Audio Soundizer */}
      {filteredClicksByDay.length > 0 && (
        <motion.div variants={fadeUp}>
          <TrafficSonar data={filteredClicksByDay} />
        </motion.div>
      )}

      {/* Traffic Sonar & Audio Soundizer */}
      {filteredClicksByDay.length > 0 && (
        <motion.div variants={fadeUp}>
          <TrafficSonar data={filteredClicksByDay} />
        </motion.div>
      )}

      {/* Global Clicks Flight Paths Map */}
      <motion.div variants={fadeUp}>
        <GlobalFlightPathsMap referrers={analytics.referrers} />
      </motion.div>

      {/* OS & Device Distribution Circle meters */}
      <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-6">
        {/* Device breakdown card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Devices Used
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution of desktop vs mobile visitors</p>
          </div>

          {devices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No device data available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4 items-center">
              {devices.slice(0, 3).map((item) => {
                let icon = Laptop;
                let color = "oklch(0.62 0.22 35)"; // primary
                if (item.device === "Mobile") {
                  icon = Smartphone;
                  color = "oklch(0.78 0.18 65)"; // amber
                } else if (item.device === "Tablet") {
                  icon = Tablet;
                  color = "oklch(0.58 0.10 260)"; // blue
                }
                const totalClicks = devices.reduce((sum, d) => sum + d.count, 0);
                const pct = totalClicks > 0 ? Math.round((item.count / totalClicks) * 100) : 0;
                
                return (
                  <ProgressRing
                    key={item.device}
                    percentage={pct}
                    label={item.device}
                    count={item.count}
                    icon={icon}
                    color={color}
                  />
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Operating Systems breakdown card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Operating Systems
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Platforms of redirect requests</p>
          </div>

          {os.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No platform data available</p>
          ) : (
            <div className="space-y-3.5">
              {os.slice(0, 5).map((item) => {
                const totalClicks = os.reduce((sum, o) => sum + o.count, 0);
                const pct = totalClicks > 0 ? Math.round((item.count / totalClicks) * 100) : 0;
                
                let icon = Monitor;
                if (item.os === "macOS" || item.os === "iOS") icon = Apple;
                else if (item.os === "Android" || item.os === "Mobile") icon = Smartphone;
                else if (item.os === "Linux") icon = Terminal;

                const Icon = icon;

                return (
                  <div key={item.os} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="truncate">{item.os}</span>
                        <span className="text-muted-foreground font-mono">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Referrers & Browsers lists */}
      <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-6">
        {/* Referrers list */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Top Referrers
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Where the clicks originated from</p>
          </div>
          {analytics.referrers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No referrer data</p>
          ) : (
            <div className="space-y-4">
              {analytics.referrers.slice(0, 5).map((ref) => {
                const maxRef = analytics.referrers[0]?.count || 1;
                const pct = Math.round((ref.count / analytics.total) * 100);
                return (
                  <div key={ref.source}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-foreground truncate max-w-[70%]">
                        {ref.source === "" ? (
                          <span className="italic text-muted-foreground font-normal">Direct / Unknown</span>
                        ) : (
                          ref.source
                        )}
                      </span>
                      <span className="text-muted-foreground font-mono">{ref.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(ref.count / maxRef) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Browsers list */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Browsers Used
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Desktop & mobile user browser engines</p>
          </div>
          {analytics.browsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No browser data</p>
          ) : (
            <div className="space-y-4">
              {analytics.browsers.slice(0, 5).map((b) => {
                const maxBrowser = analytics.browsers[0]?.count || 1;
                const pct = Math.round((b.count / analytics.total) * 100);
                return (
                  <div key={b.browser}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-foreground">{b.browser}</span>
                      <span className="text-muted-foreground font-mono">{b.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(b.count / maxBrowser) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60"
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

/* Beautiful custom circular Progress Ring component */
interface ProgressRingProps {
  percentage: number;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function ProgressRing({ percentage, label, count, icon: Icon, color }: ProgressRingProps) {
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="relative flex items-center justify-center">
        {/* SVG Circle Progress */}
        <svg width="72" height="72" className="rotate-[-90deg]">
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          <motion.circle
            cx="36"
            cy="36"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex items-center justify-center text-muted-foreground">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground truncate max-w-[90px]">{label}</p>
        <p className="text-[10px] text-muted-foreground font-semibold font-mono mt-0.5">{count} ({percentage}%)</p>
      </div>
    </div>
  );
}

/* Custom interactive Area SVG Chart with Hover Scrubber Tooltip */
interface InteractiveAreaChartProps {
  data: { date: string; count: number }[];
}

function InteractiveAreaChart({ data }: InteractiveAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(500);
  
  const height = 180;
  const paddingX = 24;
  const paddingY = 20;

  // Handle resizing of the SVG chart container
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setChartWidth(entry.contentRect.width || 500);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const maxVal = useMemo(() => {
    const val = Math.max(...data.map((d) => d.count), 0);
    return val === 0 ? 5 : val + Math.ceil(val * 0.15); // Add 15% top padding, default 5 if zero
  }, [data]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => {
      const x = paddingX + (i / Math.max(data.length - 1, 1)) * (chartWidth - paddingX * 2);
      const y = height - paddingY - (d.count / maxVal) * (height - paddingY * 2);
      return { x, y, date: d.date, count: d.count };
    });
  }, [data, chartWidth, maxVal]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (2 * (points[i].x - points[i - 1].x)) / 3;
      const cpY2 = points[i].y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length < 2) return "";
    return `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }, [points, pathD]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closestIdx = 0;
    let minDist = Math.abs(points[0].x - mouseX);

    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Absolute Tooltip Panel */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-card border border-border/50 shadow-lg text-xs leading-none space-y-1 glass-card"
            style={{
              left: `${Math.min(
                Math.max(hoveredPoint.x - 60, 10),
                chartWidth - 130
              )}px`,
              top: `${Math.max(hoveredPoint.y - 65, 0)}px`,
            }}
          >
            <p className="text-muted-foreground font-semibold">
              {new Date(hoveredPoint.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-foreground font-bold font-mono">
              <span className="text-primary">{hoveredPoint.count}</span> clicks
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        width="100%"
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        className="overflow-visible select-none cursor-crosshair"
      >
        <defs>
          <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Grid helper lines */}
        {[0, 0.5, 1].map((r, i) => {
          const y = paddingY + r * (height - paddingY * 2);
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={chartWidth - paddingX}
              y2={y}
              stroke="var(--border)"
              strokeOpacity="0.25"
              strokeDasharray="3 3"
            />
          );
        })}

        {points.length >= 2 && (
          <>
            {/* Shaded area path */}
            <path d={areaD} fill="url(#chartArea)" />

            {/* Glowing stroke path */}
            <motion.path
              d={pathD}
              fill="transparent"
              stroke="url(#chartStroke)"
              strokeWidth="2.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Hover scrubber components */}
        {hoveredPoint && (
          <>
            {/* Scrubber vertical line */}
            <line
              x1={hoveredPoint.x}
              y1={paddingY}
              x2={hoveredPoint.x}
              y2={height - paddingY}
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-55"
            />
            {/* Outer halo */}
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="8"
              fill="var(--primary)"
              className="opacity-20"
            />
            {/* Inner glowing dot */}
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="4.5"
              fill="var(--primary)"
              stroke="white"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* Start / End Date labels */}
        {points.length >= 2 && (
          <>
            <text
              x={paddingX}
              y={height - 4}
              className="text-[10px] font-bold text-muted-foreground fill-current"
            >
              {new Date(data[0].date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
            <text
              x={chartWidth - paddingX}
              y={height - 4}
              textAnchor="end"
              className="text-[10px] font-bold text-muted-foreground fill-current"
            >
              {new Date(data[data.length - 1].date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

interface ClickDay {
  date: string;
  count: number;
}

function TrafficSonar({ data }: { data: ClickDay[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const intervalRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
  };

  const maxClicks = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const playFrequency = (count: number) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (count === 0) {
      // Play a very subtle mechanical radar tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.003, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
      return;
    }

    // Play a high frequency chime based on click counts
    const minHz = 261.63; // C4
    const maxHz = 1046.50; // C6
    const ratio = count / maxClicks;
    const freq = minHz + ratio * (maxHz - minHz);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Add micro-arpeggio harmonic
    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = "triangle";
    oscHarmonic.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    oscHarmonic.start();
    osc.stop(ctx.currentTime + 0.2);
    oscHarmonic.stop(ctx.currentTime + 0.2);
  };

  const startScan = () => {
    if (isPlaying) {
      stopScan();
      return;
    }
    initAudio();
    setIsPlaying(true);
    setCurrentIndex(0);
    playFrequency(data[0]?.count || 0);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= data.length) {
        idx = 0; // Loop radar
      }
      setCurrentIndex(idx);
      playFrequency(data[idx]?.count || 0);
    }, 280);
  };

  const stopScan = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Render Radar sweep Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;

    const draw = () => {
      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = 96);
      const divisor = data.length > 1 ? data.length - 1 : 1;

      ctx.clearRect(0, 0, width, height);

      // Draw radar grid lines
      ctx.strokeStyle = "rgba(150, 150, 150, 0.08)";
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (height / 4) * i);
        ctx.lineTo(width, (height / 4) * i);
        ctx.stroke();
      }

      // Render clicks timeline outline
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = (i / divisor) * width;
        const y = height - (d.count / maxClicks) * (height - 24) - 12;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(150, 150, 150, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Render radar sweep bar
      if (currentIndex !== -1) {
        const scanX = (currentIndex / divisor) * width;
        
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, height);
        ctx.strokeStyle = "#f55d20"; // Hex for primary orange
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow trail overlay
        const gradient = ctx.createLinearGradient(scanX - 30, 0, scanX, 0);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, "rgba(245, 93, 32, 0.15)");
        ctx.fillStyle = gradient;
        ctx.fillRect(scanX - 30, 0, 30, height);

        // Intersecting point
        const currentClick = data[currentIndex]?.count || 0;
        const intersectY = height - (currentClick / maxClicks) * (height - 24) - 12;
        
        ctx.beginPath();
        ctx.arc(scanX, intersectY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#f55d20";
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(scanX, intersectY, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(245, 93, 32, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [data, currentIndex, maxClicks]);

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/50 bg-card overflow-hidden glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Audio-Visual Traffic Sonar Soundizer
          </span>
        </div>
        <Button
          onClick={startScan}
          size="sm"
          className="rounded-xl px-4 h-8 text-xs font-semibold gap-1.5 cursor-pointer"
        >
          {isPlaying ? "Pause Sonar" : "Play Traffic Sonar"}
        </Button>
      </div>

      <canvas ref={canvasRef} className="h-24 w-full bg-muted/5 border border-border/40 rounded-xl" />
      <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
        <span>{data[0] ? new Date(data[0].date).toLocaleDateString() : ""}</span>
        <span>Click chimes are played matching click metrics over time</span>
        <span>{data[data.length - 1] ? new Date(data[data.length - 1].date).toLocaleDateString() : ""}</span>
      </div>
    </div>
  );
}

function GlobalFlightPathsMap({ referrers }: { referrers: { source: string; count: number }[] }) {
  // Land clusters ellipses coordinates
  const LAND_CLUSTERS = [
    { cx: 100, cy: 50, rx: 50, ry: 20 }, // N America
    { cx: 160, cy: 120, rx: 25, ry: 40 }, // S America
    { cx: 300, cy: 45, rx: 35, ry: 15 }, // Europe
    { cx: 320, cy: 110, rx: 30, ry: 35 }, // Africa
    { cx: 440, cy: 60, rx: 65, ry: 25 }, // Asia
    { cx: 500, cy: 145, rx: 20, ry: 15 }, // Australia
  ];

  // Procedural deterministic map generation
  const mapDots = useMemo(() => {
    const dots: { x: number; y: number }[] = [];
    const count = 160;
    
    let seed = 42;
    const rnd = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    LAND_CLUSTERS.forEach((cluster) => {
      const clusterPoints = Math.round((count * (cluster.rx * cluster.ry)) / 5000);
      for (let i = 0; i < clusterPoints; i++) {
        const angle = rnd() * Math.PI * 2;
        const r = rnd();
        const dist = r * 0.85;
        dots.push({
          x: cluster.cx + Math.cos(angle) * cluster.rx * dist,
          y: cluster.cy + Math.sin(angle) * cluster.ry * dist,
        });
      }
    });
    return dots;
  }, []);

  const paths = useMemo(() => {
    const destination = { name: "San Francisco Server Core", x: 90, y: 55 };
    
    const hubs = {
      LDN: { name: "London, UK", x: 280, y: 40 },
      FRA: { name: "Frankfurt, Germany", x: 310, y: 44 },
      BLR: { name: "Bangalore, India", x: 410, y: 92 },
      TKY: { name: "Tokyo, Japan", x: 480, y: 55 },
      SYD: { name: "Sydney, Australia", x: 500, y: 155 },
      NY: { name: "New York, USA", x: 140, y: 55 },
    };

    const keys = Object.keys(hubs) as (keyof typeof hubs)[];
    
    const results = referrers.map((ref, index) => {
      const hostname = ref.source.toLowerCase();
      let key: keyof typeof hubs = "NY";
      
      if (hostname.includes(".uk") || hostname.includes("co.uk")) key = "LDN";
      else if (hostname.includes(".de")) key = "FRA";
      else if (hostname.includes(".jp")) key = "TKY";
      else if (hostname.includes(".in")) key = "BLR";
      else if (hostname.includes(".au")) key = "SYD";
      else {
        const hashIdx = (hostname.length + index) % keys.length;
        key = keys[hashIdx];
      }

      const origin = hubs[key];
      const controlX = (origin.x + destination.x) / 2;
      const controlY = Math.min(origin.y, destination.y) - 45;
      const pathId = `flight-path-${index}-${key}`;

      return {
        id: pathId,
        originName: origin.name,
        originX: origin.x,
        originY: origin.y,
        destX: destination.x,
        destY: destination.y,
        controlX,
        controlY,
        source: ref.source,
        count: ref.count,
      };
    });

    return { results, destination };
  }, [referrers]);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border/50 bg-card overflow-hidden glass-card select-none">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Global Clicks Flight Paths
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time spatial visualization of click origins and traffic routing
        </p>
      </div>

      <div className="relative border border-border/40 rounded-xl overflow-hidden bg-black/20 w-full h-[220px] flex items-center justify-center">
        <svg viewBox="0 0 600 220" className="w-full h-full">
          {/* Graticule latitude grid lines */}
          <line x1="0" y1="55" x2="600" y2="55" stroke="oklch(0.62 0.02 50 / 5%)" strokeWidth="0.8" />
          <line x1="0" y1="110" x2="600" y2="110" stroke="oklch(0.62 0.02 50 / 5%)" strokeWidth="0.8" />
          <line x1="0" y1="165" x2="600" y2="165" stroke="oklch(0.62 0.02 50 / 5%)" strokeWidth="0.8" />

          {/* Procedural Landmass dots */}
          {mapDots.map((dot, index) => (
            <circle
              key={index}
              cx={dot.x}
              cy={dot.y}
              r="1.2"
              fill="oklch(0.62 0.02 50 / 22%)"
            />
          ))}

          {/* Render Flight arcs & animated indicators */}
          {paths.results.map((p) => {
            const pathD = `M ${p.originX} ${p.originY} Q ${p.controlX} ${p.controlY} ${p.destX} ${p.destY}`;
            
            return (
              <g key={p.id}>
                {/* Glowing flight arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  className="opacity-25"
                />

                {/* Animated beam pulse */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="15 100"
                  style={{
                    animation: "dash 3s linear infinite",
                  }}
                  className="opacity-70"
                />

                {/* Pulse origin beacon */}
                <circle cx={p.originX} cy={p.originY} r="3" fill="oklch(0.78 0.18 65)" />
                <circle cx={p.originX} cy={p.originY} r="6" fill="none" stroke="oklch(0.78 0.18 65)" strokeWidth="0.7" className="animate-ping" style={{ transformOrigin: `${p.originX}px ${p.originY}px` }} />

                {/* Flying bubble element */}
                <circle r="2.5" fill="white">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path={pathD} />
                </circle>
              </g>
            );
          })}

          {/* Render Destination Core Hub */}
          <circle cx={paths.destination.x} cy={paths.destination.y} r="4.5" fill="var(--primary)" />
          <circle cx={paths.destination.x} cy={paths.destination.y} r="10" fill="none" stroke="var(--primary)" strokeWidth="1" className="animate-pulse" style={{ transformOrigin: `${paths.destination.x}px ${paths.destination.y}px` }} />
        </svg>

        {/* CSS custom keyframe style injection inside component for dash animation */}
        <style jsx global>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -115;
            }
          }
        `}</style>
      </div>

      <div className="flex flex-wrap gap-2 justify-center select-none text-[10px]">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/50 rounded-md border border-border/40">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f55d20]" />
          <span className="text-muted-foreground font-semibold">Server Core: San Francisco</span>
        </div>
        {paths.results.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/40 rounded-md border border-border/40 font-mono text-[9px]">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-foreground">{p.originName.split(",")[0]}</span>
            <span className="text-muted-foreground">({p.count} clicks via {p.source.split(".")[0]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
