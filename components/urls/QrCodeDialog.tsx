"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { Download, Loader2, Check, Copy, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QrCodeDialogProps {
  shortUrl: string;
  shortCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({ shortUrl, shortCode, open, onOpenChange }: QrCodeDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRendering(true);
    setError(false);
    setQrDataUrl(null);

    QRCode.toDataURL(shortUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#0a0a0f", light: "#ffffff" },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("[QRCode] generation failed:", err);
        setError(true);
      })
      .finally(() => setRendering(false));
  }, [open, shortUrl]);

  const download = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-${shortCode}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyImage = async () => {
    if (!qrDataUrl) return;
    const blob = await (await fetch(qrDataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-base">QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div className="relative" style={{ width: 240, height: 240 }}>
            <AnimatePresence mode="wait">
              {rendering && (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-card"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </motion.div>
              )}
              {error && !rendering && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/30"
                >
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-xs text-muted-foreground">Failed to generate QR</p>
                </motion.div>
              )}
              {qrDataUrl && !rendering && (
                <motion.img
                  key="qr"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={qrDataUrl}
                  alt={`QR code for ${shortUrl}`}
                  className="rounded-xl"
                  width={240}
                  height={240}
                />
              )}
            </AnimatePresence>
          </div>

          <p className="font-mono text-xs text-muted-foreground text-center break-all max-w-[200px]">
            {shortUrl}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyImage}
              disabled={rendering || error || !qrDataUrl}
              className="rounded-xl gap-1.5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              onClick={download}
              disabled={rendering || error || !qrDataUrl}
              className="rounded-xl gap-1.5"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
