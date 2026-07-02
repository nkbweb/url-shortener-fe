"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10"
              >
                <CheckCircle className="h-7 w-7 text-emerald-500" />
              </motion.div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>,
                we&apos;ve sent a password reset link.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Didn&apos;t get it? Check spam or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-primary hover:underline underline-offset-4 font-medium"
                >
                  try again
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground tracking-tight">
                    Forgot password?
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-11 rounded-xl font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
