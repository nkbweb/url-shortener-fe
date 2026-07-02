import type { Metadata } from "next";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: "Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh bg-background overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-48 -left-48 h-[600px] w-[600px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.22 35), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-48 -right-48 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.18 65), transparent)" }}
      />

      {/* Theme toggle in top-right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Centered card */}
      <div className="flex min-h-dvh items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  );
}
