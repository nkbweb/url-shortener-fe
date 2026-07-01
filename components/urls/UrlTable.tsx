"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

interface UrlTableProps {
  urls: ShortUrl[];
  isLoading: boolean;
  hasMore: boolean;
  onEdit: (id: string, payload: UpdateUrlPayload) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onLoadMore?: () => void;
}

export function UrlTable({ urls, isLoading, hasMore, onEdit, onDelete, onLoadMore }: UrlTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ShortUrl | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShortUrl | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
        className="glass-card rounded-2xl p-6 space-y-3"
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
        className="glass-card rounded-2xl p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10"
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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-3 relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search links by URL or short code…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-muted/30 border-border/60 focus:border-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">
                Original URL
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Short link
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-20">
                Clicks
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Created
              </TableHead>
              <TableHead className="pr-4 w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <motion.td
                  colSpan={5}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  No links match &ldquo;{searchQuery}&rdquo;
                </motion.td>
              </TableRow>
            ) : (
              filtered.map((url, i) => (
                <motion.tr
                  key={url.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 260, damping: 24 }}
                  data-slot="table-row"
                  className="border-b border-border/40 transition-colors hover:bg-muted/30 group"
                >
                  <TableCell className="pl-6 max-w-[240px]">
                    <a
                      href={url.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                      title={url.originalUrl}
                    >
                      <span className="truncate">{url.originalUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <a
                        href={getRedirectUrl(url.shortCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        /{url.shortCode}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Copy short URL"
                        onClick={() => copyToClipboard(url)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        {copiedId === url.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] rounded-full bg-gradient-to-r from-accent/30 to-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground tabular-nums">
                      {url.clicks}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                    {new Date(url.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Analytics */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/analytics/${url.shortCode}`}
                              aria-label="View analytics"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            View analytics
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* QR code */}
                      <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getRedirectUrl(url.shortCode))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="QR code"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150 opacity-0 group-hover:opacity-100"
                      >
                        <QrCode className="h-4 w-4" />
                      </a>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit URL"
                        onClick={() => { setEditTarget(url); setEditDialogOpen(true); }}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Dialog open={deleteDialogOpen && deleteTarget?.id === url.id} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteTarget(null); }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete URL"
                            disabled={deletingId === url.id}
                            onClick={() => { setDeleteTarget(url); setDeleteDialogOpen(true); }}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                          >
                            {deletingId === url.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </DialogTrigger>
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
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

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
          className="mt-4 text-center"
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
              className="rounded-xl px-8"
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
