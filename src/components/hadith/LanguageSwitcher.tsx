"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Check } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { HadithLanguage } from "@/lib/hadith";

export default function LanguageSwitcher({
  availableLanguages,
  currentLanguage,
}: {
  availableLanguages: HadithLanguage[];
  currentLanguage: string;
}) {
  const { language, setLanguage } = useHadithPreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const activeCode = language ?? currentLanguage;
  const current = availableLanguages.find((l) => l.code === activeCode) ?? availableLanguages[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Filter by language"
        className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        style={{ background: "var(--soft)", color: "var(--soft-text)" }}
      >
        <Languages size={15} />
        <span className={`max-w-[7rem] truncate ${current?.code === "urd" ? "font-urdu" : current?.direction === "rtl" ? "font-arabic-text" : ""}`}>
          {current?.nativeName ?? "Language"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-[var(--r-card)] border p-1.5"
            style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
          >
            {availableLanguages.map((lang) => {
              const active = lang.code === activeCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-[var(--r-chip)] px-3 py-2.5 text-left text-[14px] transition-colors"
                  style={{ background: active ? "var(--soft)" : "transparent", color: active ? "var(--soft-text)" : "var(--text)" }}
                >
                  <span dir={lang.direction} className={lang.code === "urd" ? "font-urdu" : lang.direction === "rtl" ? "font-arabic-text" : ""}>
                    {lang.nativeName}
                  </span>
                  {active && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
