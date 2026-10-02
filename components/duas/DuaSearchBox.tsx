"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Result = {
  id: string;
  href: string;
  category: string;
  chapter: string;
  arabic: string;
  translation: string;
  reference: string;
};

export default function DuaSearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const latest = useRef("");

  useEffect(() => {
    const q = query.trim();
    latest.current = q;
    if (!q) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await fetch(`/api/dua-search?q=${encodeURIComponent(q)}`).then((r) => r.json());
        if (latest.current === q) setResults(data.results ?? []);
      } catch {
        if (latest.current === q) setResults([]);
      } finally {
        if (latest.current === q) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="rounded-card border border-border bg-white p-3 shadow-sm">
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 4 4" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search duas — e.g. sleep, travel, anxiety, forgiveness, 2:201, رَبَّنَا…"
          className="w-full rounded-full border border-border bg-bg py-2.5 pl-10 pr-10 text-sm text-teal-dark outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:bg-white"
        />
        {loading && (
          <span className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        )}
      </div>

      {results && results.length === 0 && !loading && (
        <p className="mt-3 px-2 text-sm text-muted">No duas match &ldquo;{query}&rdquo;.</p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                className="block rounded-card border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-aqua/30"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary-deep">
                  {r.category} · {r.chapter}
                </p>
                <p dir="rtl" lang="ar" className="mt-1.5 text-right font-arabic text-lg leading-loose text-teal-dark line-clamp-1">
                  {r.arabic}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-2">{r.translation}</p>
                {r.reference && <p className="mt-1 text-[11px] text-gold line-clamp-1">{r.reference}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
