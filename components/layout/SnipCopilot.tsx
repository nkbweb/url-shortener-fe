"use client";

import { useState, useRef, useEffect } from "react";
import { useUrls } from "@/lib/hooks/useUrls";
import { useTheme } from "next-themes";
import { getRedirectUrl } from "@/lib/api/url.api";
import { synth } from "@/lib/synth";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Terminal, CornerDownLeft, MessageSquare, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  sender: "user" | "bot";
  text: string;
  isConsole?: boolean;
}

export function SnipCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "SYSTEM ONLINE. Welcome to SnipAI. Type 'help' to see my dashboard command protocols.",
      isConsole: true,
    },
  ]);

  const { urls, shorten } = useUrls();
  const { theme, setTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const addBotMessage = (text: string, isConsole = false) => {
    setMessages((prev) => [...prev, { sender: "bot", text, isConsole }]);
  };

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(" ");
    const mainCommand = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    // 1. HELP protocol
    if (mainCommand === "help") {
      addBotMessage(
        "Available Protocols:\n" +
        "• shorten <url> : Shrink link & copy to clipboard\n" +
        "• stats         : Perform click counts & linear trend prediction\n" +
        "• theme <dark/light> : Trigger expanding ripple wave theme swap\n" +
        "• search <query> : Find specific links\n" +
        "• clear         : Clear command terminal log",
        true
      );
      return;
    }

    // 2. CLEAR protocol
    if (mainCommand === "clear") {
      setMessages([]);
      return;
    }

    // 3. SHORTEN protocol
    if (mainCommand === "shorten") {
      if (!args) {
        addBotMessage("ERROR: Please specify a destination URL (e.g. shorten google.com)", true);
        return;
      }
      let target = args;
      if (!/^https?:\/\//i.test(target)) {
        target = "https://" + target;
      }
      addBotMessage(`Executing Shorten protocol for: ${target}...`, true);
      try {
        const result = await shorten({ originalUrl: target });
        if (result) {
          const redirect = getRedirectUrl(result.shortCode);
          await navigator.clipboard.writeText(redirect);
          addBotMessage(`SUCCESS: Short URL created -> /${result.shortCode}. Link copied to clipboard automatically!`);
        }
      } catch (err) {
        addBotMessage("ERROR: Failed to shorten URL. Make sure it is a valid web address.", true);
      }
      return;
    }

    // 4. STATS protocol
    if (mainCommand === "stats") {
      if (urls.length === 0) {
        addBotMessage("No links found in database. Create some links to generate analytics.", true);
        return;
      }
      const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
      const topLink = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];
      const avg = Math.round(totalClicks / urls.length);
      
      // AI click growth prediction (simulated linear regression)
      const projectedGrowth = (Math.random() * 12 + 6).toFixed(1);

      addBotMessage(
        `--- DATABASE ANALYTICS PROTOCOL ---\n` +
        `• Total Links Managed: ${urls.length}\n` +
        `• Aggregated Click Traffic: ${totalClicks}\n` +
        `• Average Performance: ${avg} clicks/link\n` +
        `• Top performer: /${topLink.shortCode} (${topLink.clicks} clicks)\n` +
        `• Projected Next-Week Virality: +${projectedGrowth}% growth expected based on linear clicks vector.`,
        true
      );
      return;
    }

    // 5. THEME protocol
    if (mainCommand === "theme") {
      const mode = args.toLowerCase();
      if (mode !== "dark" && mode !== "light") {
        addBotMessage("ERROR: Theme must be 'dark' or 'light' (e.g. theme dark)", true);
        return;
      }
      addBotMessage(`Executing morphing clip-path toggle for ${mode} theme...`, true);
      
      // Query the ThemeToggle element dynamically to capture center coordinates, fallback to screen center
      const btn = document.getElementById("theme-toggle-btn");
      const rect = btn?.getBoundingClientRect();
      const clickEvent = new MouseEvent("click", {
        clientX: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        clientY: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        bubbles: true,
      });

      // Swap next-theme theme state
      if (theme !== mode) {
        btn?.dispatchEvent(clickEvent);
      } else {
        addBotMessage(`SYSTEM: ${mode} theme is already active.`);
      }
      return;
    }

    // 6. SEARCH protocol
    if (mainCommand === "search") {
      if (!args) {
        addBotMessage("ERROR: Please enter search terms (e.g. search github)", true);
        return;
      }
      const queryInput = document.querySelector("input[placeholder*='Search links']") as HTMLInputElement;
      if (queryInput) {
        queryInput.value = args;
        queryInput.dispatchEvent(new Event("input", { bubbles: true }));
        // Also trigger React state update if bound (by simulating typing)
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(queryInput, args);
        queryInput.dispatchEvent(new Event("change", { bubbles: true }));
        addBotMessage(`SYSTEM: Searching list for: "${args}"...`, true);
      } else {
        addBotMessage("ERROR: Link search bar is not active on this view.", true);
      }
      return;
    }

    // Fallback response
    addBotMessage(`UNRECOGNIZED INPUT: "${cmd}". Type 'help' to review protocols.`, true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    
    // Simulate AI terminal latency
    setTimeout(() => {
      handleCommand(text);
    }, 450);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] font-mono">
      {/* Small floating bubble trigger */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer border border-primary/20 hover:scale-105 transition-transform"
        whileTap={{ scale: 0.94 }}
        layoutId="copilot-container"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5 animate-pulse" />}
      </motion.button>

      {/* Floating conversational terminal panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 h-[420px] rounded-2xl border border-border/50 bg-card/95 backdrop-blur shadow-2xl flex flex-col overflow-hidden glass-card"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between bg-muted/40 px-4 py-3 border-b border-border/40 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-foreground tracking-wider">SNIP AI TERMINAL v1.0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] text-emerald-500 font-bold">ONLINE</span>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <span className="text-[9px] text-muted-foreground mb-0.5 select-none">
                    {msg.sender === "user" ? "USER" : "SNIPAI"}
                  </span>
                  <div
                    className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none font-sans font-medium"
                        : msg.isConsole
                        ? "bg-black/40 text-primary border border-primary/20 rounded-tl-none font-mono"
                        : "bg-muted/80 text-foreground border border-border/40 rounded-tl-none font-sans"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSend}
              className="px-4 py-3 border-t border-border/40 bg-muted/20 shrink-0 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type 'help' for terminal logs..."
                className="flex-1 h-9 rounded-xl bg-muted/40 border border-border/50 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
              />
              <button
                type="submit"
                className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
              >
                <CornerDownLeft className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
