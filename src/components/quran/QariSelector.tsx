"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, Search, Check, Languages, SkipForward } from "lucide-react";
import { useQari } from "./QariProvider";
import { RECITATION_VOICES, TRANSLATION_VOICES } from "@/lib/reciters";
import { useClickOutside } from "@/hooks/useClickOutside";

export default function QariSelector() {
  const { reciter, reciterId, setReciterId, translationVoiceOn, setTranslationVoiceOn, autoContinue, setAutoContinue } =
    useQari();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RECITATION_VOICES;
    return RECITATION_VOICES.filter((r) => r.name.toLowerCase().includes(q) || r.style?.toLowerCase().includes(q));
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors"
        style={{ background: "var(--soft)", color: "var(--soft-text)" }}
      >
        <Mic2 size={15} />
        <span className="hidden max-w-[9rem] truncate sm:inline">{reciter.name}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 max-w-[92vw] overflow-hidden rounded-[var(--r-card)] border"
            style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
          >
            <div className="p-3">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--faint)" }}>
                Choose your reciter
              </p>
              <div className="relative mt-2">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--faint)" }} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search qari…"
                  className="w-full rounded-[var(--r-btn)] border py-2 pl-9 pr-3 text-[13.5px] outline-none"
                  style={{ background: "var(--card-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto px-2 pb-2">
              {filtered.map((r) => {
                const active = r.id === reciterId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setReciterId(r.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-[var(--r-chip)] px-3 py-2 text-left text-[13.5px] transition-colors"
                    style={{ background: active ? "var(--soft)" : "transparent", color: active ? "var(--soft-text)" : "var(--text)" }}
                  >
                    <span className="truncate">
                      {r.name}
                      {r.style && <span style={{ color: "var(--faint)" }}> · {r.style}</span>}
                    </span>
                    {active && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-[13px]" style={{ color: "var(--faint)" }}>
                  No reciter matches &ldquo;{query}&rdquo;.
                </p>
              )}
            </div>

            <div className="space-y-1 border-t p-3" style={{ borderColor: "var(--hair)" }}>
              {TRANSLATION_VOICES.length > 0 && (
                <ToggleRow
                  icon={Languages}
                  label={`Also play ${TRANSLATION_VOICES[0].language} translation audio`}
                  sub={TRANSLATION_VOICES[0].style}
                  checked={translationVoiceOn}
                  onChange={setTranslationVoiceOn}
                />
              )}
              <ToggleRow
                icon={SkipForward}
                label="Auto-continue to next surah"
                sub="Complete Quran playback, ayah by ayah"
                checked={autoContinue}
                onChange={setAutoContinue}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  sub,
  checked,
  onChange,
}: {
  icon: typeof Languages;
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-[var(--r-chip)] px-2 py-2 text-left transition-colors"
      style={{ background: "transparent" }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--soft)", color: "var(--primary)" }}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium" style={{ color: "var(--text)" }}>
          {label}
        </p>
        {sub && (
          <p className="truncate text-[11.5px]" style={{ color: "var(--faint)" }}>
            {sub}
          </p>
        )}
      </div>
      <span
        className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? "var(--primary)" : "var(--border)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </span>
    </button>
  );
}
