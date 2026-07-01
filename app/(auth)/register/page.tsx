import type { Metadata } from "next";
import Link from "next/link";
import { LinkIcon, BarChart3, Shield, Zap } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

const perks = [
  { icon: Zap, text: "Free forever — no credit card" },
  { icon: BarChart3, text: "Track every click" },
  { icon: Shield, text: "Enterprise-grade security" },
];

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-4xl animate-slide-up">
      {/* Brand showcase — hidden on small screens */}
      <div className="hidden lg:flex flex-1 flex-col justify-center pr-12">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/30">
          <LinkIcon className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Start shortening with{" "}
          <span className="text-gradient">Snip</span>
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-sm">
          Create clean, trustworthy short links in seconds. Free forever — no credit card required.
        </p>

        <div className="mt-8 space-y-4">
          {perks.map((perk) => (
            <div key={perk.text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <perk.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">{perk.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="w-full lg:w-[400px]">
        <div className="glass-card w-full rounded-2xl p-8 animate-scale-in">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/30">
                <LinkIcon className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Start shortening with{" "}
              <span className="text-gradient">Snip</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Free forever — no credit card required
            </p>
          </div>

          <RegisterForm />
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
