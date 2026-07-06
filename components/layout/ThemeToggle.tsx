"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconVariants = {
  initial: { opacity: 0, rotate: -90, scale: 0.5 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 90, scale: 0.5 },
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; color: string } | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = theme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";
    const x = e.clientX;
    const y = e.clientY;
    
    // Standard dark/light colors
    const color = nextTheme === "dark" ? "#09090b" : "#ffffff";
    
    setRipple({ x, y, color });
    
    // Swap theme under the wave overlay midway
    setTimeout(() => {
      setTheme(nextTheme);
    }, 180);

    setTimeout(() => {
      setRipple(null);
    }, 600);
  };

  return (
    <>
      <Button
        id="theme-toggle-btn"
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={handleToggle}
        className="relative h-9 w-9 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary z-[50]"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute"
            >
              <Moon className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute"
            >
              <Sun className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Clip-path liquid morph overlay */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            initial={{ clipPath: `circle(0px at ${ripple.x}px ${ripple.y}px)` }}
            animate={{ clipPath: `circle(${Math.max(window.innerWidth, window.innerHeight) * 1.5}px at ${ripple.x}px ${ripple.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{ backgroundColor: ripple.color }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
