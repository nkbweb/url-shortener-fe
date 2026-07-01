"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

export function LoginAnimation({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="flex w-full max-w-4xl"
    >
      {children}
    </motion.div>
  );
}
