"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, BookOpen, X } from "lucide-react";
import type { SurahSummary, RevelationPlace } from "@/lib/quran";

type PlaceFilter = "All" | RevelationPlace;

const PLACE_FILTERS: PlaceFilter[] = ["All", "Meccan", "Medinan"];

export default function SurahBrowser({ surahs }: { surahs: SurahSummary[] }) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<PlaceFilter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return surahs.filter((s) => {
      if (place !== "All" && s.revelationPlace !== place) return false;
      if (!q) return true;
      return (
        s.surahName.toLowerCase().includes(q) ||
        s.surahNameTranslation.toLowerCase().includes(q) ||
        s.surahNameArabic.includes(query.trim()) ||
        String(s.surahNumber) === q
      );
    });
  }, [surahs, query, place]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--faint)" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search surah by name, meaning or number…"
            className="w-full rounded-[var(--r-btn)] border py-3 pl-11 pr-10 text-[15px] outline-none transition-colors focus:border-[var(--primary)]"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1"
              style={{ color: "var(--muted)" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div
          className="flex shrink-0 rounded-[var(--r-btn)] border p-1"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {PLACE_FILTERS.map((p) => {
            const active = place === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlace(p)}
                className="rounded-[var(--r-chip)] px-3.5 py-2 text-[13.5px] font-semibold transition-colors"
                style={{
                  background: active ? "var(--grad-btn)" : "transparent",
                  color: active ? "var(--primary-ink)" : "var(--muted)",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-3xl text-[13px]" style={{ color: "var(--faint)" }}>
        Showing {filtered.length} of {surahs.length} surahs
      </p>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s, i) => (
          <motion.div
            key={s.surahNumber}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: Math.min(i, 12) * 0.02 }}
          >
            <Link
              href={`/quran/${s.surahNumber}`}
              className="card-surface group flex items-center gap-4 p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              {/* Ayah-medallion number */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full" aria-hidden>
                  <path
                    d="M24 2 L30 8 L38 6 L38 14 L46 18 L40 24 L46 30 L38 34 L38 42 L30 40 L24 46 L18 40 L10 42 L10 34 L2 30 L8 24 L2 18 L10 14 L10 6 L18 8 Z"
                    fill="var(--soft)"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                </svg>
                <span className="relative text-[14px] font-bold" style={{ color: "var(--primary)" }}>
                  {s.surahNumber}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate text-[15.5px] font-semibold" style={{ color: "var(--text)" }}>
                    {s.surahName}
                  </h3>
                  <span dir="rtl" className="font-arabic shrink-0 text-[18px]" style={{ color: "var(--soft-text)" }}>
                    {s.surahNameArabic}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[12px]" style={{ color: "var(--muted)" }}>
                  <span className="truncate">{s.surahNameTranslation}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11.5px]" style={{ color: "var(--faint)" }}>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {s.revelationPlace}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={12} /> {s.totalVerses} verses
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-[15px]" style={{ color: "var(--muted)" }}>
            No surah matches &ldquo;{query}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
