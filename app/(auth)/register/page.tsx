import type { Metadata } from "next";
import { LinkIcon } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
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
          Start shortening with{" "}
          <span className="text-gradient">Snip</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Free forever — no credit card required
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
