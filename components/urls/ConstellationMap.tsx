"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShortUrl } from "@/lib/types/url.types";
import { synth } from "@/lib/synth";
import { getRedirectUrl } from "@/lib/api/url.api";
import { Move, Link2, Copy, Check, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";

interface ConstellationMapProps {
  urls: ShortUrl[];
}

interface Node {
  id: string;
  url: ShortUrl;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  label: string;
  domain: string;
  image: HTMLImageElement | null;
  imageLoaded: boolean;
}

export function ConstellationMap({ urls }: ConstellationMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to extract clean domain
  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace("www.", "");
    } catch {
      return "link";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 420);

    const centerNode = {
      x: width / 2,
      y: height / 2,
      radius: 28,
      label: "Snip Hub",
    };

    // Calculate maximum clicks to scale node sizes
    const maxClicks = Math.max(...urls.map((u) => u.clicks), 1);

    // Initialize nodes
    const nodes: Node[] = urls.map((u, index) => {
      const angle = (index / urls.length) * Math.PI * 2;
      const distance = 110 + Math.random() * 40;
      
      const domainName = getDomain(u.originalUrl);
      const radius = 16 + (u.clicks / maxClicks) * 16; // Mass matches popularity

      // Load brand favicon asynchronously
      let img: HTMLImageElement | null = null;
      let imgLoaded = false;
      if (typeof window !== "undefined") {
        img = new Image();
        img.src = `https://www.google.com/s2/favicons?sz=64&domain=${domainName}`;
        img.onload = () => {
          imgLoaded = true;
        };
      }

      return {
        id: u.id,
        url: u,
        x: centerNode.x + Math.cos(angle) * distance,
        y: centerNode.y + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        radius,
        targetRadius: radius,
        label: `/${u.shortCode}`,
        domain: domainName,
        image: img,
        imageLoaded: imgLoaded,
      };
    });

    let draggedNode: Node | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Physics Calculations (Spring forces, repulsions, drag)
      nodes.forEach((node) => {
        if (node === draggedNode) {
          node.x = mouseX;
          node.y = mouseY;
          node.vx = 0;
          node.vy = 0;
          return;
        }

        // Attraction to central hub (spring model)
        const dxHub = centerNode.x - node.x;
        const dyHub = centerNode.y - node.y;
        const distHub = Math.sqrt(dxHub * dxHub + dyHub * dyHub) || 1;
        const springStrength = 0.0035;
        const targetDist = 120 + (node.radius * 2);
        const springForce = (distHub - targetDist) * springStrength;
        
        node.vx += (dxHub / distHub) * springForce;
        node.vy += (dyHub / distHub) * springForce;

        // Mutual repulsion between nodes (to avoid clusters)
        nodes.forEach((other) => {
          if (node.id === other.id) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = node.radius + other.radius + 36;
          
          if (dist < minDist) {
            const force = (minDist - dist) * 0.015;
            node.vx -= (dx / dist) * force;
            node.vy -= (dy / dist) * force;
          }
        });

        // Pull back from canvas limits
        const boundaryForce = 0.15;
        const padding = 20;
        if (node.x < padding) node.vx += boundaryForce;
        if (node.x > width - padding) node.vx -= boundaryForce;
        if (node.y < padding) node.vy += boundaryForce;
        if (node.y > height - padding) node.vy -= boundaryForce;

        // Apply friction and move
        node.vx *= 0.88;
        node.vy *= 0.88;
        node.x += node.vx;
        node.y += node.vy;
      });

      // 2. Rendering Connections (Pulsing glowing cables)
      const pulse = 0.6 + Math.sin(Date.now() / 250) * 0.15;
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.moveTo(centerNode.x, centerNode.y);
        ctx.lineTo(node.x, node.y);
        // Glow cable style
        ctx.strokeStyle = `rgba(245, 93, 32, ${(10 + pulse * 12) / 100})`;
        ctx.lineWidth = 1.8 + pulse * 0.8;
        ctx.stroke();
        
        // Inner core core cable
        ctx.strokeStyle = "var(--border)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });

      // 3. Rendering Central Hub (Snip Engine Core)
      const hubPulse = 1 + Math.sin(Date.now() / 400) * 0.06;
      ctx.beginPath();
      ctx.arc(centerNode.x, centerNode.y, centerNode.radius * hubPulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 93, 32, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "var(--primary)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerNode.x, centerNode.y, centerNode.radius - 6, 0, Math.PI * 2);
      ctx.fillStyle = "var(--primary)";
      ctx.fill();
      
      // Central icon text placeholder
      ctx.fillStyle = "var(--primary-foreground)";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SNIP", centerNode.x, centerNode.y);

      // 4. Rendering Satellite URL Nodes
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        
        // Outer glow aura
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isHovered ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isHovered 
          ? "rgba(234, 179, 8, 0.15)" 
          : "rgba(245, 93, 32, 0.08)";
        ctx.fill();

        // Node border
        ctx.strokeStyle = isHovered ? "var(--accent)" : "var(--primary)";
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // White/Card Node content background
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "var(--card)";
        ctx.fill();
        ctx.stroke();

        // Draw favicon or default text
        if (node.image && (node.imageLoaded || node.image.complete)) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius - 2.5, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            node.image,
            node.x - (node.radius - 2.5),
            node.y - (node.radius - 2.5),
            (node.radius - 2.5) * 2,
            (node.radius - 2.5) * 2
          );
          ctx.restore();
        } else {
          // Initials fallback
          ctx.fillStyle = "var(--foreground)";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            node.domain.charAt(0).toUpperCase() || "?",
            node.x,
            node.y
          );
        }

        // Label tooltip tags (underneath nodes)
        ctx.fillStyle = "var(--foreground)";
        ctx.font = isHovered ? "bold 11px monospace" : "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.label, node.x, node.y + node.radius + 6);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Event Handlers for interactive drag & drop + hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = x;
      mouseY = y;

      if (draggedNode) return;

      // Find if hovering a node
      let foundNode: Node | null = null;
      for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= node.radius + 5) {
          foundNode = node;
          break;
        }
      }

      if (foundNode && (!hoveredNode || hoveredNode.id !== foundNode.id)) {
        setHoveredNode(foundNode);
        synth.playTick(); // Tick on hover
      } else if (!foundNode && hoveredNode) {
        setHoveredNode(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 5) {
          draggedNode = node;
          break;
        }
      }
    };

    const handleMouseUp = () => {
      draggedNode = null;
    };

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      centerNode.x = width / 2;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [urls, hoveredNode]);

  // Node actions from holograph dialog
  const handleCopyLink = async (node: Node) => {
    const fullUrl = getRedirectUrl(node.url.shortCode);
    await navigator.clipboard.writeText(fullUrl);
    synth.playCopy();
    setCopiedId(node.id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative border border-border/50 bg-card/60 backdrop-blur rounded-2xl overflow-hidden shadow-lg select-none">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        <Move className="h-3.5 w-3.5" />
        <span>Constellation Map (Interactive Drag & Hover)</span>
      </div>

      <canvas ref={canvasRef} className="block cursor-grab active:cursor-grabbing w-full bg-muted/5" />

      {/* Holograph Info overlay when a node is hovered */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 z-20 md:w-80 p-4 border border-border/50 bg-card/90 backdrop-blur rounded-xl shadow-xl glass-card flex flex-col gap-3 font-sans"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  {hoveredNode.domain}
                </h4>
                <p className="text-sm font-bold text-foreground font-mono leading-none mt-0.5 truncate">
                  /{hoveredNode.url.shortCode}
                </p>
              </div>
              
              {/* Copy Action button */}
              <motion.button
                type="button"
                onClick={() => handleCopyLink(hoveredNode)}
                className="h-8 px-3 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer text-xs font-semibold gap-1 shrink-0"
                whileTap={{ scale: 0.96 }}
              >
                {copiedId === hoveredNode.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
            </div>
            
            <div className="h-[1px] bg-border/40 w-full" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate max-w-[200px]" title={hoveredNode.url.originalUrl}>
                {hoveredNode.url.originalUrl}
              </span>
              <div className="flex items-center gap-1 shrink-0 font-semibold font-mono text-accent">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>{hoveredNode.url.clicks} clicks</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
