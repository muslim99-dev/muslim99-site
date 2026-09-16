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
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["All", "Meccan", "Medinan"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                filter === f ? "bg-primary text-white border-primary" : "border-border text-muted hover:border-primary"
              }`}
            >
              {f === "All" ? "All" : f === "Meccan" ? "Makki" : "Madani"}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search surah by name or number..."
          className="rounded-full border border-border bg-white px-4 py-2 text-sm w-full sm:w-72 outline-none focus:border-primary"
        />
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
