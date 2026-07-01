"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { fadeUp, fadeIn, stagger, scaleIn, itemVariants } from "@/lib/motion";

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
  { value: "10K+", label: "Links created" },
  { value: "50K+", label: "Clicks tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "To start" },
];

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
      <div
        aria-hidden
        className="pointer-events-none fixed -top-48 -left-48 h-[600px] w-[600px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.21 35), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-48 -right-48 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.16 70), transparent)" }}
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform duration-200 group-hover:scale-110">
            <Link2 className="h-4 w-4" />
          </div>
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
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" />
            Free forever — no credit card required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Shorten links,{" "}
            <span className="text-gradient">amplify impact</span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Create clean, trustworthy short links that people love to click.
            Track performance with real-time analytics — all for free.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl text-base font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                Start shortening
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-xl text-base font-semibold"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero visual */}
        <div className="mt-16 sm:mt-24 mx-auto max-w-4xl animate-slide-up">
          <div className="glass-card rounded-2xl p-1 overflow-hidden shadow-2xl">
            <div className="rounded-xl bg-background p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div className="h-12 rounded-xl bg-muted/50 border border-border/60 flex items-center pl-10 pr-4 text-sm text-muted-foreground">
                    https://very-long-url.com/with/a/really/long/path
                  </div>
                </div>
                <div className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center px-6 text-sm whitespace-nowrap cursor-pointer hover:bg-primary/90 transition-colors">
                  Shorten →
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <div className="font-mono text-primary font-medium">
                  snip.to/abc123
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything you need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Powerful features packed into a simple, clean interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-8 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-5">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="glass-card rounded-3xl p-10 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ready to{" "}
            <span className="text-gradient">simplify</span> your links?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Join thousands of users who trust Snip for their link management.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="mt-8 h-12 px-8 rounded-xl text-base font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 animate-pulse-glow"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8">
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
      </footer>
    </div>
  );
}
