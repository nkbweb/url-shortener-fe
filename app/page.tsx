"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import {
  Link2,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/authStore";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { fadeUp, stagger, staggerFast, scaleIn, itemVariants } from "@/lib/motion";

const headingWords = [
  { text: "Shorten", gradient: false },
  { text: "links,", gradient: false },
  { text: "amplify", gradient: true },
  { text: "impact", gradient: true },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Generate short links in milliseconds with our blazing-fast infrastructure.",
  },
  {
    icon: BarChart3,
    title: "Click Analytics",
    desc: "Track every click with detailed analytics and see where your traffic comes from.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Enterprise-grade security with encrypted tokens and 99.9% uptime.",
  },
];

const stats = [
  { value: 10000, suffix: "+", label: "Links created" },
  { value: 50000, suffix: "+", label: "Clicks tracked" },
  { value: 99.9, suffix: "%", label: "Uptime", decimal: 1 },
  { value: 0, prefix: "Free", label: "To start" },
];

function useTypewriter(text: string, speed: number, delay: number) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        if (i > text.length) {
          clearInterval(interval);
          setDone(true);
          return;
        }
        setDisplayed(text.slice(0, i));
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [text, speed, delay]);

  return { displayed, done };
}

function useCountUp(target: number, duration: number, delay: number, decimal?: number) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(v),
    });
    return controls.stop;
  }, [started, target, duration]);

  return decimal ? count.toFixed(decimal) : Math.round(count).toLocaleString();
}

function CounterStat({ value, suffix, label, decimal, prefix }: {
  value: number;
  suffix?: string;
  label: string;
  decimal?: number;
  prefix?: string;
}) {
  const count = useCountUp(value, 1.8, 200, decimal);

  return (
    <motion.div variants={scaleIn} className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-foreground">
        {prefix || ""}{count}{suffix || ""}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (!mounted) return null;
  if (isAuthenticated) return null;

  return (
    <div className="relative min-h-dvh bg-background overflow-hidden">
      {/* Background decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        aria-hidden
        className="pointer-events-none fixed -top-48 -left-48 h-[600px] w-[600px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.22 35), transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        aria-hidden
        className="pointer-events-none fixed -bottom-48 -right-48 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.18 65), transparent)" }}
      />

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md"
          >
            <Link2 className="h-4 w-4" />
          </motion.div>
          <span className="text-gradient text-lg font-bold tracking-tight">Snip</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="rounded-lg">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-lg btn-glow">
              Get started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="h-3.5 w-3.5 fill-primary" />
            </motion.span>
            Free forever — no credit card required
          </motion.div>

          {/* Train heading */}
          <div className="relative w-full overflow-hidden">
            <motion.h1
              className="flex w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear", delay: 0.6 }}
            >
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className="flex items-baseline gap-x-[0.3em] whitespace-nowrap px-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                >
                  {headingWords.map((word) => (
                    <span
                      key={word.text}
                      className={word.gradient ? "text-gradient text-gradient-shimmer" : "text-foreground"}
                    >
                      {word.text}
                    </span>
                  ))}
                </span>
              ))}
            </motion.h1>
          </div>

          <motion.p
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            Create clean, trustworthy short links that people love to click.
            Track performance with real-time analytics — all for free.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-xl text-base font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                >
                  Start shortening
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-xl text-base font-semibold"
                >
                  Sign in
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero visual with typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 sm:mt-24 mx-auto max-w-4xl"
        >
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl"
          >
            <div className="rounded-xl bg-background p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div className="h-12 rounded-xl bg-muted/50 border border-border/60 flex items-center pl-10 pr-4 text-sm text-muted-foreground font-mono overflow-hidden">
                    <TypewriterDemo />
                  </div>
                </div>
                <motion.div
                  className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center px-6 text-sm whitespace-nowrap cursor-pointer"
                  whileHover={{ scale: 1.02, backgroundColor: "var(--primary-hover, oklch(0.55 0.24 35))" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shorten →
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 1.8, duration: 0.4, ease: "easeOut" }}
                className="mt-4 flex items-center gap-3 text-sm overflow-hidden"
              >
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.0, type: "spring", stiffness: 200, damping: 16 }}
                  className="font-mono text-primary font-medium flex items-center gap-2"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </motion.span>
                  snip.to/abc123
                </motion.div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 16 }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats with counter */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-y border-border/40 bg-muted/30"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <motion.div
            variants={staggerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <CounterStat key={stat.label} {...stat} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything you need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Powerful features packed into a simple, clean interface.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 350, damping: 18 } }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl border border-border/50 bg-card p-8 overflow-hidden"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5"
                >
                  <feature.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-10 sm:p-16 text-center"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.62 0.22 35), transparent)" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
            >
              Ready to{" "}
              <span className="text-gradient">simplify</span> your links?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-muted-foreground max-w-md mx-auto"
            >
              Join thousands of users who trust Snip for their link management.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
              className="mt-8"
            >
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-xl text-base font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 animate-pulse-glow"
                  >
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-border/40 py-8"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span className="font-medium text-foreground">Snip</span>
            <span>— URL Shortener</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

function TypewriterDemo() {
  const { displayed, done } = useTypewriter("https://very-long-url.com/with/a/really/long/path", 30, 600);

  return (
    <span className="flex items-center gap-0.5">
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="inline-block w-[2px] h-4 bg-primary ml-0.5"
        />
      )}
    </span>
  );
}
