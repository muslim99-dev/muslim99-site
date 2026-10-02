"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Pagination, { PAGE_SIZE } from "@/components/tafsir/Pagination";

type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number };

/** Surah chooser; links keep the chosen edition (if any). */
export default function SurahGrid({ surahs, edition, coverage }: { surahs: Surah[]; edition?: string; coverage?: Record<number, number | null> }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();
  const list = surahs.filter(
    (s) =>
      (!coverage || s.number in coverage) &&
      (!q || String(s.number) === q || `${s.englishName} ${s.englishNameTranslation}`.toLowerCase().includes(q) || s.name.includes(query.trim()))
  );

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  function go(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        placeholder="Find a surah by name or number…"
        className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary sm:w-80"
      />
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => {
          const covered = coverage?.[s.number];
          return (
            <Link
              key={s.number}
              href={`/tafsir/${s.number}${edition ? `?edition=${edition}` : ""}`}
              className="group flex items-center gap-3 rounded-card border border-border bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <span className="grid h-10 w-10 shrink-0 rotate-45 place-items-center rounded-lg bg-aqua ring-1 ring-primary/15">
                <span className="-rotate-45 text-xs font-semibold tabular-nums text-primary-deep">{s.number}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-teal-dark group-hover:text-primary-deep">{s.englishName}</span>
                <span className="block truncate text-[11px] text-muted">
                  {typeof covered === "number" ? `${covered} of ${s.numberOfAyahs} ayahs` : `${s.englishNameTranslation} · ${s.numberOfAyahs} ayahs`}
                </span>
              </span>
              <span dir="rtl" className="shrink-0 font-quran text-lg text-teal-dark/80">
                {s.name}
              </span>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && <p className="mt-4 text-sm text-muted">No surahs match.</p>}
      <Pagination page={current} total={totalPages} count={list.length} label="surahs" onChange={go} />
    </div>
  );
}
