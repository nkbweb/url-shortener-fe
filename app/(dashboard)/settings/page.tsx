"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound, ShieldCheck, User, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/stores/authStore";
import { apiClient, ApiError } from "@/lib/api/client";
import { fadeUp, stagger, itemVariants, staggerSpring } from "@/lib/motion";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await apiClient.patch("/api/auth/change-password", { currentPassword, newPassword });

      toast.success("Password changed. Please log in again.");
      clearAuth();
      router.push("/login");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to change password";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              <span className="text-gradient">Settings</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerSpring} initial="hidden" animate="visible" className="grid gap-6 max-w-xl">
        {/* Account info card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Account</h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/30 border border-border/50 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Account active and verified</span>
          </div>
        </motion.div>

        {/* Change password card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
              <p className="text-xs text-muted-foreground">
                You will be logged out after changing your password
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="rounded-xl bg-muted/30 border-border/60 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="rounded-xl bg-muted/30 border-border/60 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="rounded-xl bg-muted/30 border-border/60 focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl shadow-lg shadow-primary/25"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
