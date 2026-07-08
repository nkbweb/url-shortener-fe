"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { synth } from "@/lib/synth";
import {
  Copy,
  Trash2,
  Pencil,
  Check,
  ExternalLink,
  Search,
  QrCode,
  BarChart3,
  AlertTriangle,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ShortUrl, UpdateUrlPayload } from "@/lib/types/url.types";
import { getRedirectUrl } from "@/lib/api/url.api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditUrlDialog } from "./EditUrlDialog";
import { QrCodeDialog } from "./QrCodeDialog";
import { ConstellationMap } from "./ConstellationMap";

interface UrlTableProps {
  urls: ShortUrl[];
  isLoading: boolean;
  hasMore: boolean;
  onEdit: (id: string, payload: UpdateUrlPayload) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onLoadMore?: () => void;
}

export function UrlTable({ urls, isLoading, hasMore, onEdit, onDelete, onLoadMore }: UrlTableProps) {
  const [viewMode, setViewMode] = useState<"table" | "constellation">("table");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ShortUrl | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShortUrl | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState<ShortUrl | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const maxClicks = useMemo(() => {
    return Math.max(...urls.map((u) => u.clicks), 1);
  }, [urls]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return urls;
    const q = searchQuery.toLowerCase();
    return urls.filter(
      (u) =>
        u.originalUrl.toLowerCase().includes(q) ||
        u.shortCode.toLowerCase().includes(q)
    );
  }, [urls, searchQuery]);

  const copyToClipboard = async (url: ShortUrl) => {
    const shortUrl = getRedirectUrl(url.shortCode);
    await navigator.clipboard.writeText(shortUrl);
    synth.playCopy();
    setCopiedId(url.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteDialogOpen(false);
    await onDelete(deleteTarget.id).catch(() => {});
    setDeletingId(null);
    setDeleteTarget(null);
  };

  if (isLoading && urls.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-3"
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="h-12 rounded-xl bg-muted/60 animate-pulse"
          />
        ))}
      </motion.div>
    );
  }

  if (urls.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
        >
          <ExternalLink className="h-8 w-8 text-primary" />
        </motion.div>
        <p className="text-base font-semibold text-foreground">No links yet</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Shorten your first URL above to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Search and View Switcher */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links by URL or short code…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex h-10 items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border/50 select-none shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none ${
              viewMode === "table"
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Table View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("constellation")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none ${
              viewMode === "constellation"
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Constellation Map
          </button>
        </div>
      </motion.div>

      {viewMode === "constellation" ? (
        <motion.div
          key="constellation"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ConstellationMap urls={filtered} />
        </motion.div>
      ) : (
        /* Table card replacement (clean feed list) */
        <motion.div
          key="table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card/15 rounded-2xl border border-border/30">
              No links match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filtered.map((url, i) => {
              const domain = getDomain(url.originalUrl);
              const clickRatio = Math.round((url.clicks / maxClicks) * 100);

              return (
                <motion.div
                  key={url.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, type: "spring", stiffness: 300, damping: 26 }}
                  className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-morph hover:border-primary/30 hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Left: Favicon & URL Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {domain && (
                      <img
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-xl bg-card border border-border/40 p-1.5 select-none mt-0.5"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={getRedirectUrl(url.shortCode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm font-semibold text-primary hover:underline underline-offset-4"
                        >
                          /{url.shortCode}
                        </a>
                        <motion.button
                          aria-label="Copy short URL"
                          onClick={() => copyToClipboard(url)}
                          whileTap={{ scale: 0.85 }}
                          className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                        >
                          <AnimatePresence mode="wait">
                            {copiedId === url.id ? (
                              <motion.span
                                key="check"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 45 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              >
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="copy"
                                initial={{ scale: 0, rotate: 45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -45 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                        title={url.originalUrl}
                      >
                        <span className="truncate">{url.originalUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </div>

                  {/* Middle: Telemetry Tracker & Date */}
                  <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end shrink-0 border-t sm:border-t-0 border-border/20 pt-3 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary tabular-nums">
                        {url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}
                      </span>
                      <div className="w-16 h-1 bg-muted/65 rounded-full overflow-hidden" title={`${clickRatio}% of maximum clicks`}>
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          style={{ width: `${clickRatio}%` }}
                        />
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end gap-0.5 text-right">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Created</span>
                      <span className="text-xs text-foreground font-medium">
                        {new Date(url.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-0.5 bg-white/5 dark:bg-white/10 border border-white/5 dark:border-white/10 rounded-xl p-0.5 shadow-sm transition-opacity duration-200">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/analytics/${url.shortCode}`}
                              aria-label="View analytics"
                              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="top">Analytics</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              aria-label="QR code"
                              onClick={() => { setQrTarget(url); setQrDialogOpen(true); }}
                              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">QR Code</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              aria-label="Edit URL"
                              onClick={() => { setEditTarget(url); setEditDialogOpen(true); }}
                              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Dialog open={deleteDialogOpen && deleteTarget?.id === url.id} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteTarget(null); }}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <button
                                  aria-label="Delete URL"
                                  disabled={deletingId === url.id}
                                  onClick={() => { setDeleteTarget(url); setDeleteDialogOpen(true); }}
                                  className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                                >
                                  {deletingId === url.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top">Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 mb-2">
                              <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <DialogTitle className="text-center text-lg">
                              Delete link?
                            </DialogTitle>
                            <DialogDescription className="text-center">
                              This will permanently delete{" "}
                              <span className="font-mono font-medium text-foreground">
                                /{url.shortCode}
                              </span>{" "}
                              and all its click data.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                              variant="outline"
                              onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
                              className="flex-1 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={confirmDelete}
                              className="flex-1 rounded-xl"
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* QR dialog */}
      {qrTarget && (
        <QrCodeDialog
          shortUrl={getRedirectUrl(qrTarget.shortCode)}
          shortCode={qrTarget.shortCode}
          open={qrDialogOpen}
          onOpenChange={(open) => { setQrDialogOpen(open); if (!open) setQrTarget(null); }}
        />
      )}

      {/* Edit dialog */}
      {editTarget && (
        <EditUrlDialog
          url={editTarget}
          open={editDialogOpen}
          onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditTarget(null); }}
          onSave={onEdit}
        />
      )}

      {/* Load more */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-center"
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
              className="rounded-xl px-8 border-border/60"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="mr-2 h-4 w-4" />
              )}
              Load more
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function getDomain(urlStr: string) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

