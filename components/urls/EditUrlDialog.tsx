"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { ShortUrl, UpdateUrlPayload } from "@/lib/types/url.types";

interface EditUrlDialogProps {
  url: ShortUrl;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, payload: UpdateUrlPayload) => Promise<unknown>;
}

export function EditUrlDialog({ url, open, onOpenChange, onSave }: EditUrlDialogProps) {
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [shortCode, setShortCode] = useState(url.shortCode);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(url.id, { originalUrl, shortCode });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = originalUrl !== url.originalUrl || shortCode !== url.shortCode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit URL</DialogTitle>
          <DialogDescription>
            Update the original URL or custom short code.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="originalUrl" className="text-sm font-medium">Original URL</label>
            <Input
              id="originalUrl"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/long-url"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="shortCode" className="text-sm font-medium">Short Code</label>
            <Input
              id="shortCode"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="my-custom-code"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
