"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .regex(/^\S+$/, "Password must not contain spaces"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500"];

const criteria = [
  { label: "8+ characters", test: (pw: string) => pw.length >= 8 },
  { label: "Uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "Number", test: (pw: string) => /[0-9]/.test(pw) },
  { label: "Special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password") || "";
  const strength = useMemo(() => getStrength(password), [password]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="register-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
            className="pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="register-password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...register("password")}
            className="pl-9 h-11 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
          />
        </div>

        {/* Strength bar */}
        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-1"
          >
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <motion.div
                  key={level}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: level <= strength ? 1 : 0 }}
                  className={`h-full flex-1 rounded-full origin-left ${level <= strength ? strengthColors[strength] : "bg-muted"}`}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${strength <= 2 ? "text-destructive" : strength <= 3 ? "text-yellow-600 dark:text-yellow-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {strengthLabels[strength]}
            </p>

            {/* Criteria checklist */}
            <div className="space-y-1">
              {criteria.map((c) => {
                const ok = c.test(password);
                return (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    {ok ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                      {c.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        id="register-submit-btn"
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-xl font-semibold btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          id="register-login-link"
          className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
