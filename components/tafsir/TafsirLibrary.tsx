"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TAFSIRS, tafsirLanguages } from "@/lib/tafsir";
import Pagination, { PAGE_SIZE } from "@/components/tafsir/Pagination";

const TYPE_ORDER = ["Tafsir", "Concise (Al-Mukhtasar)", "Grammar & I'rab", "Qira'at (Recitations)", "Vocabulary (Gharib)", "Occasions of Revelation"];

export default function TafsirLibrary() {
  const languages = useMemo(() => tafsirLanguages(), []);
  const [language, setLanguage] = useState("All");
  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const list = TAFSIRS.filter(
    (t) =>
      (language === "All" || t.language === language) &&
      (type === "All" || t.type === type) &&
      (!q || `${t.name} ${t.author} ${t.language} ${t.type}`.toLowerCase().includes(q))
  );
  const types = TYPE_ORDER.filter((ty) => TAFSIRS.some((t) => t.type === ty && (language === "All" || t.language === language)));

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  function go(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:w-80">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, author, language…"
            className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          {["All", ...types].map((ty) => (
            <button
              key={ty}
              onClick={() => {
                setType(ty);
                setPage(1);
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                type === ty ? "border-teal-dark bg-teal-dark text-white" : "border-border bg-white text-muted hover:border-primary"
              }`}
            >
              {ty}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[{ language: "All", count: TAFSIRS.length }, ...languages].map((l) => (
          <button
            key={l.language}
            onClick={() => {
              setLanguage(l.language);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              language === l.language ? "bg-primary text-white" : "bg-aqua/60 text-primary-deep hover:bg-aqua"
            }`}
          >
            {l.language} <span className="opacity-60">{l.count}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        {list.length} {list.length === 1 ? "edition" : "editions"}
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <Link
            key={t.slug}
            href={`/tafsir/edition/${t.slug}`}
            className="group flex flex-col rounded-card border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold leading-snug text-teal-dark group-hover:text-primary-deep">{t.name}</p>
              <span className="shrink-0 rounded-md bg-aqua px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-deep">
                {t.language}
              </span>
            </div>
            {t.author && <p className="mt-1 text-sm text-muted">{t.author}</p>}
            <p className="mt-auto pt-3 text-[11px] text-muted">
              {t.type}
              {t.surahs < 114 && <span className="text-gold"> · {t.surahs} of 114 surahs</span>}
            </p>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-6 text-sm text-muted">No editions match these filters.</p>}
      <Pagination page={current} total={totalPages} count={list.length} label="tafsirs" onChange={go} />
    </div>
  );
}
