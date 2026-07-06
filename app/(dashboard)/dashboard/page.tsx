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
  sparkline,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  border: string;
  sparkline: number[];
  color: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const x = mouseX - width / 2;
    const y = mouseY - height / 2;
    
    const rotX = -(y / (height / 2)) * 7;
    const rotY = (x / (width / 2)) * 7;
    
    setTransform(`perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`);
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
      variants={itemVariants}
      className={`group relative rounded-2xl border border-border/50 bg-card p-5 ${border} glass-card cursor-default select-none transition-shadow duration-300 hover:shadow-xl`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${accent} opacity-50`}
      />
      {/* Dynamic glare layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 130px at ${glare.x}% ${glare.y}%, ${color}25, transparent 75%)`,
          opacity: glare.opacity,
        }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
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

        {/* Mini SVG Sparkline */}
        <div className="shrink-0 pl-1">
          <Sparkline data={sparkline} color={color} />
        </div>
      </div>
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
    <svg width={width} height={height} className="overflow-visible opacity-70 group-hover:opacity-100 transition-opacity">
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

