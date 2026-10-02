"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Result = { surah: number; ayah: number; snippet: string };

export default function TafsirSearch({
  edition,
  editionName,
  surah,
  dir
}: {
  edition: string;
  editionName: string;
  surah?: number;
  dir: "rtl" | "ltr";
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"surah" | "all">(surah ? "surah" : "all");
  const [data, setData] = useState<{ count: number; results: Result[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef("");

  useEffect(() => {
    const q = query.trim();
    const key = `${q}|${scope}|${edition}`;
    latest.current = key;
    if (!q) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const params = new URLSearchParams({ q, edition });
      if (scope === "surah" && surah) params.set("surah", String(surah));
      try {
        const res = await fetch(`/api/tafsir-search?${params}`);
        const json = await res.json();
        if (latest.current !== key) return;
        if (!res.ok) {
          setError(json.error ?? "Search failed.");
          setData(null);
        } else {
          setError(null);
          setData(json);
        }
      } catch {
        if (latest.current === key) setError("Couldn't reach search.");
      } finally {
        if (latest.current === key) setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, scope, edition, surah]);

  return (
    <div className="rounded-card border border-border bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${editionName}…`}
            className="w-full rounded-full border border-border bg-bg py-2.5 pl-10 pr-10 text-sm text-teal-dark outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:bg-white"
          />
          {loading && (
            <span className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          )}
        </div>
        {surah && (
          <div className="inline-flex shrink-0 rounded-full border border-border bg-bg p-0.5 text-xs">
            {(["surah", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${scope === s ? "bg-teal-dark text-white" : "text-muted"}`}
              >
                {s === "surah" ? "This surah" : "Whole tafsir"}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-3 px-2 text-sm text-muted">{error}</p>}
      {data && data.results.length === 0 && !loading && <p className="mt-3 px-2 text-sm text-muted">No matches for &ldquo;{query}&rdquo;.</p>}
      {data && data.results.length > 0 && (
        <div className="mt-3">
          <p className="px-2 text-xs text-muted">
            {data.count > data.results.length ? `Showing ${data.results.length} of ${data.count} matches` : `${data.count} matches`}
          </p>
          <ul className="mt-2 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {data.results.map((r, i) => (
              <li key={`${r.surah}-${r.ayah}-${i}`}>
                <Link
                  href={`/tafsir/${r.surah}?edition=${edition}&ayah=${r.ayah}#ayah-${r.ayah}`}
                  className="block rounded-card border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-aqua/30"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-deep">
                    Surah {r.surah} · Ayah {r.ayah}
                  </p>
                  <p dir={dir} className={`mt-1 text-sm leading-relaxed text-muted line-clamp-3 ${dir === "rtl" ? "text-right" : ""}`}>
                    {r.snippet}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
