"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useUrls } from "@/lib/hooks/useUrls";
import { useAuth } from "@/lib/hooks/useAuth";
import { getRedirectUrl } from "@/lib/api/url.api";
import {
  Search,
  Zap,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  LogOut,
  Link2,
  Copy,
  Check,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { synth } from "@/lib/synth";

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: any;
  action: () => void | Promise<any>;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { urls, fetchUrls, shorten, isShortenLoading } = useUrls();
  const { logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch URLs when the palette is opened
  useEffect(() => {
    if (open) {
      fetchUrls().catch(() => {});
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open, fetchUrls]);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine if the input is a valid URL for instant shortening
  const isUrl = useMemo(() => {
    if (!query) return false;
    try {
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return pattern.test(query) || query.startsWith("http://") || query.startsWith("https://");
    } catch {
      return false;
    }
  }, [query]);

  // Prepare navigation actions
  const actions: PaletteItem[] = useMemo(() => {
    const isDark = theme === "dark";
    return [
      {
        id: "nav-dashboard",
        title: "Go to Dashboard",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => {
          router.push("/dashboard");
          setOpen(false);
        },
      },
      {
        id: "nav-settings",
        title: "Go to Settings",
        category: "Navigation",
        icon: Settings,
        action: () => {
          router.push("/settings");
          setOpen(false);
        },
      },
      {
        id: "action-theme",
        title: `Switch to ${isDark ? "Light" : "Dark"} Mode`,
        category: "Preferences",
        icon: isDark ? Sun : Moon,
        action: () => {
          setTheme(isDark ? "light" : "dark");
          toast.success(`Switched to ${isDark ? "light" : "dark"} mode`);
        },
      },
      {
        id: "action-logout",
        title: "Log out",
        category: "Account",
        icon: LogOut,
        action: () => {
          logout();
          setOpen(false);
        },
      },
    ];
  }, [theme, setTheme, router, logout]);

  // Filter links from URLs list
  const filteredLinks = useMemo(() => {
    if (!query.trim() || isUrl) return urls.slice(0, 5);
    const q = query.toLowerCase();
    return urls
      .filter(
        (u) =>
          u.originalUrl.toLowerCase().includes(q) ||
          u.shortCode.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [urls, query, isUrl]);

  // Merge items based on state
  const visibleItems = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];

    // 1. Instant Shorten Action
    if (isUrl) {
      list.push({
        id: "instant-shorten",
        title: `Shorten: "${query}"`,
        category: "Quick Action",
        icon: Zap,
        action: async () => {
          let targetUrl = query;
          if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl;
          }
          try {
            const shortened = await shorten({ originalUrl: targetUrl });
            toast.success("Short URL created & copied!");
            if (shortened?.shortCode) {
              const fullShortUrl = getRedirectUrl(shortened.shortCode);
              await navigator.clipboard.writeText(fullShortUrl);
            }
            setQuery("");
            setOpen(false);
          } catch {
            // Toast error handled inside hook
          }
        },
      });
    }

    // 2. Search Links results
    if (filteredLinks.length > 0) {
      filteredLinks.forEach((link) => {
        list.push({
          id: `link-${link.id}`,
          title: `Copy /${link.shortCode}`,
          subtitle: link.originalUrl,
          category: "Links",
          icon: Link2,
          action: async () => {
            const fullUrl = getRedirectUrl(link.shortCode);
            await navigator.clipboard.writeText(fullUrl);
            synth.playCopy();
            setCopiedCode(link.shortCode);
            toast.success("Copied to clipboard!");
            setTimeout(() => {
              setCopiedCode(null);
              setOpen(false);
            }, 1000);
          },
        });
      });
    }

    // 3. Navigation Actions (always present, but lower priority if matching URLs/links)
    const matchingActions = actions.filter((act) =>
      act.title.toLowerCase().includes(query.toLowerCase())
    );
    list.push(...matchingActions);

    return list;
  }, [isUrl, query, filteredLinks, actions, shorten]);

  // Adjust selection when lists change
  useEffect(() => {
    setSelectedIndex(0);
  }, [visibleItems.length]);

  // Handle keyboard navigation inside search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % visibleItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = visibleItems[selectedIndex];
      if (selected) {
        selected.action();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Floating global search box trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/50 bg-muted/40 hover:bg-muted/70 text-muted-foreground text-xs transition-all duration-150 cursor-pointer"
        aria-label="Open command menu"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search actions…</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span>Ctrl</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-xl bg-card/95 border border-border/50 glass-card rounded-2xl shadow-2xl">
          <div className="flex items-center border-b border-border/40 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or paste a URL to shorten…"
              className="flex-1 h-9 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none"
              autoFocus
            />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              esc
            </kbd>
          </div>

          <div
            ref={containerRef}
            className="max-h-[330px] overflow-y-auto py-2 divide-y divide-border/20"
          >
            {visibleItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {visibleItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  const isLink = item.category === "Links";
                  const isInstant = item.id === "instant-shorten";
                  
                  return (
                    <div
                      key={item.id}
                      ref={(el) => { itemsRef.current[index] = el; }}
                      onClick={() => item.action()}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : isInstant
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isInstant && isShortenLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-none truncate">
                            {item.title}
                          </p>
                          {(item.subtitle || isLink) && (
                            <p
                              className={`text-xs mt-1 truncate ${
                                isSelected ? "text-white/80" : "text-muted-foreground"
                              }`}
                            >
                              {item.subtitle || "Short Link"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {isLink && (
                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center ${
                              isSelected ? "text-white" : "text-muted-foreground"
                            }`}
                          >
                            {copiedCode === item.id.replace("link-", "") ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </div>
                        )}
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : isInstant
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.category}
                        </span>
                        {isSelected && (
                          <CornerDownLeft className="h-3.5 w-3.5 opacity-70" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="border-t border-border/40 px-4 py-2.5 bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>Use <kbd className="font-mono bg-background px-1 border border-border rounded">↑↓</kbd> to navigate</span>
              <span><kbd className="font-mono bg-background px-1 border border-border rounded">Enter</kbd> to select</span>
            </div>
            <div>
              <span>Press <kbd className="font-mono bg-background px-1 border border-border rounded">Ctrl K</kbd> to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
