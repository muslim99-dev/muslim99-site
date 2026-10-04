"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SurahMeta } from "@/lib/quranApi";

export default function SurahListClient({ surahs }: { surahs: SurahMeta[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Meccan" | "Medinan">("All");

  const filtered = useMemo(() => {
    return surahs.filter((s) => {
      const matchesFilter = filter === "All" || s.revelationType === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || s.englishName.toLowerCase().includes(q) || s.englishNameTranslation.toLowerCase().includes(q) || String(s.number) === q;
      return matchesFilter && matchesQuery;
    });
  }, [surahs, query, filter]);

  return (
    <div>
      <div className="rounded-card border border-border bg-white p-3 shadow-sm sm:p-4">
        <div className="relative">
          <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-dark" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search all ${surahs.length} surahs by name, meaning or number…`}
            aria-label="Search surahs"
            className="w-full rounded-full border border-border bg-bg py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white sm:text-base"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
          {(["All", "Meccan", "Medinan"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f ? "bg-teal-dark text-white" : "bg-bg text-teal-dark hover:bg-aqua"
              }`}
            >
              {f === "All" ? "All surahs" : f === "Meccan" ? "Makki" : "Madani"}{" "}
              <span className="opacity-60">{f === "All" ? surahs.length : surahs.filter((s) => s.revelationType === f).length}</span>
            </button>
          ))}
          {query.trim() && (
            <span className="ml-auto text-xs text-muted">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s) => (
          <Link
            key={s.number}
            href={`/quran/${s.number}`}
            className="flex items-center gap-4 rounded-card border border-border bg-white p-4 hover:shadow-card hover:border-primary/40 transition-all"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-aqua text-primary-deep text-sm font-medium">
              {s.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-teal-dark truncate">{s.englishName}</p>
                <p dir="rtl" className="font-quran text-lg text-teal-dark shrink-0">
                  {s.name}
                </p>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {s.englishNameTranslation} · {s.revelationType === "Meccan" ? "Makki" : "Madani"} · {s.numberOfAyahs} Ayahs
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted col-span-2 py-8 text-center">No surah matches your search.</p>}
      </div>
    </div>
  );
}
