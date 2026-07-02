"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth.api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex w-full max-w-md mx-auto">
        <div className="w-full rounded-2xl border border-border/50 bg-card p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token!, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired token. Request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          {done ? (
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
                Password reset!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Redirecting to sign in…
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
                    Set new password
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    className="pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-destructive flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3 shrink-0" />
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="w-full h-11 rounded-xl font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    <>
                      Reset password
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
