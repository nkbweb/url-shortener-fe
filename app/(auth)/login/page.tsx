import type { Metadata } from "next";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-8 animate-slide-up">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <LinkIcon className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Welcome back to{" "}
          <span className="text-gradient">Snip</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to manage your short links
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
