"use client";

import { useState } from "react";
import { Copy, Trash2, Check, ExternalLink, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ShortUrl } from "@/lib/types/url.types";
import { getRedirectUrl } from "@/lib/api/url.api";

interface UrlTableProps {
  urls: ShortUrl[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function UrlTable({ urls, isLoading, onDelete }: UrlTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyToClipboard = async (url: ShortUrl) => {
    const shortUrl = getRedirectUrl(url.shortCode);
    await navigator.clipboard.writeText(shortUrl);
    setCopiedId(url.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id).catch(() => {});
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-xl bg-muted/60 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <ExternalLink className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground">No links yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Shorten your first URL above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">
              Original URL
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Short code
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
              <MousePointer className="inline h-3.5 w-3.5 mr-1" />
              Clicks
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Created
            </TableHead>
            <TableHead className="pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url, i) => (
            <TableRow
              key={url.id}
              className="border-border/40 hover:bg-muted/30 transition-colors duration-150 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Original URL */}
              <TableCell className="pl-6 max-w-[240px]">
                <a
                  href={url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors truncate group"
                  title={url.originalUrl}
                >
                  <span className="truncate">{url.originalUrl}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </TableCell>

              {/* Short code */}
              <TableCell>
                <a
                  href={getRedirectUrl(url.shortCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  /{url.shortCode}
                </a>
              </TableCell>

              {/* Clicks */}
              <TableCell className="text-center">
                <span className="inline-flex items-center justify-center min-w-[2rem] rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  {url.clicks}
                </span>
              </TableCell>

              {/* Created at */}
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(url.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>

              {/* Actions */}
              <TableCell className="pr-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    id={`copy-btn-${url.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Copy short URL"
                    onClick={() => copyToClipboard(url)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                  >
                    {copiedId === url.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    id={`delete-btn-${url.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Delete URL"
                    disabled={deletingId === url.id}
                    onClick={() => handleDelete(url.id)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
