"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={`relative flex h-9 w-16 shrink-0 items-center rounded-full border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${className}`}
      style={{
        background: isDark ? "var(--card-2)" : "var(--soft)",
        borderColor: "var(--border)",
      }}
    >
      <motion.span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: "var(--grad-btn)", boxShadow: "var(--bevel), var(--shadow-sm)" }}
        animate={{ x: isDark ? 32 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        {isDark ? (
          <Moon size={14} color="var(--primary-ink)" strokeWidth={2.25} />
        ) : (
          <Sun size={14} color="var(--primary-ink)" strokeWidth={2.25} />
        )}
      </motion.span>
    </button>
  );
}
