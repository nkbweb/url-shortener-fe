"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkIcon, LogOut, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <Link
          href="/dashboard"
          id="nav-brand-link"
          className="flex items-center gap-2 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform duration-200 group-hover:scale-110">
            <LinkIcon className="h-4 w-4" />
          </div>
          <span className="text-gradient text-lg font-bold tracking-tight">
            Snip
          </span>
        </Link>

        {/* Nav + Actions */}
        <div className="flex items-center gap-2">
          <nav className="hidden sm:flex items-center gap-1 mr-2">
            <Link
              href="/dashboard"
              id="nav-dashboard-link"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>

          <ThemeToggle />

          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                  {user.email}
                </span>
              </div>

              <Button
                id="nav-logout-btn"
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Logout"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
