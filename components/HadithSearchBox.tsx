"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type HadithResult = {
  collection: string;
  collectionName?: string;
  book: number;
  chapter: number;
  hadith_number: number;
  status?: string;
  snippet: string;
};
type BookResult = { number: number; title: string; totalHadiths: number };
type ChapterResult = { number: number; title: string; totalHadiths: number; bookNumber: number };

type Mode = "books" | "chapters" | "hadiths";

export default function HadithSearchBox({
  mode,
  collectionSlug,
  bookNumber,
  chapterNumber,
  placeholder
}: {
  mode: Mode;
  collectionSlug?: string;
  bookNumber?: number;
  chapterNumber?: number;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookResult[] | null>(null);
  const [chapters, setChapters] = useState<ChapterResult[] | null>(null);
  const [hadiths, setHadiths] = useState<HadithResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestQueryRef = useRef("");

  async function runSearch(q: string) {
    latestQueryRef.current = q;
    if (!q) {
      setBooks(null);
      setChapters(null);
      setHadiths(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, mode });
      if (collectionSlug) params.set("collection", collectionSlug);
      if (bookNumber) params.set("book", String(bookNumber));
      if (chapterNumber) params.set("chapter", String(chapterNumber));
      const res = await fetch(`/api/hadith-search?${params}`);
      const data = await res.json();
      if (latestQueryRef.current !== q) return;
      if (!res.ok) {
        setError(data.error ?? "Search failed.");
        setBooks(null);
        setChapters(null);
        setHadiths(null);
      } else {
        setBooks(data.books ?? null);
        setChapters(data.chapters ?? null);
        setHadiths(data.hadiths ?? null);
      }
    } catch {
      if (latestQueryRef.current !== q) return;
      setError("Couldn't reach search. Check your connection.");
      setBooks(null);
      setChapters(null);
      setHadiths(null);
    } finally {
      if (latestQueryRef.current === q) setLoading(false);
    }
  }

  // Live search: fires ~350ms after the user stops typing.
  useEffect(() => {
    const q = query.trim();
    const timeout = setTimeout(() => runSearch(q), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mode, collectionSlug, bookNumber, chapterNumber]);

  const defaultPlaceholder =
    mode === "books" ? "Search books by name…" : mode === "chapters" ? "Search chapters by name or number…" : "Search hadith text…";

  const hasResults = (books?.length ?? 0) + (chapters?.length ?? 0) + (hadiths?.length ?? 0) > 0;
  const searched = books !== null || chapters !== null || hadiths !== null;

  return (
    <div className="rounded-card border border-border bg-white p-4">
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? defaultPlaceholder}
          className="w-full rounded-full border border-border px-4 py-2 pr-9 text-sm outline-none focus:border-primary"
        />
        {loading && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">…</span>
        )}
      </form>

      {error && <p className="mt-3 text-xs text-muted">{error}</p>}

      {searched && !hasResults && !error && <p className="mt-3 text-sm text-muted">No matches for "{query}".</p>}

      {books && books.length > 0 && (
        <div className="mt-4 space-y-2">
          {books.map((b) => (
            <Link
              key={`book-${b.number}`}
              href={`/hadith/${collectionSlug}/${b.number}`}
              className="block rounded-card border border-border px-4 py-2.5 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-sm text-teal-dark">
                {b.number}. {b.title}
              </span>
              <span className="ml-2 text-xs text-muted">{b.totalHadiths} hadith</span>
            </Link>
          ))}
        </div>
      )}

      {chapters && chapters.length > 0 && (
        <div className="mt-4 space-y-2">
          {chapters.map((c) => (
            <Link
              key={`chapter-${c.bookNumber}-${c.number}`}
              href={`/hadith/${collectionSlug}/${c.bookNumber}/${c.number}`}
              className="block rounded-card border border-border px-4 py-2.5 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-sm text-teal-dark">
                Chapter {c.number}: {c.title}
              </span>
              <span className="ml-2 text-xs text-muted">{c.totalHadiths} hadith</span>
            </Link>
          ))}
        </div>
      )}

      {hadiths && hadiths.length > 0 && (
        <div className="mt-4 space-y-2">
          {hadiths.map((r) => (
            <Link
              key={`hadith-${r.collection}-${r.hadith_number}`}
              href={`/hadith/${r.collection}/${r.book}/${r.chapter}?hadith=${r.hadith_number}`}
              className="block rounded-card border border-border px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-primary-deep">
                  {r.collectionName ?? `Hadith`} #{r.hadith_number}
                </span>
                {r.status && (
                  <span className="shrink-0 rounded-full bg-aqua px-2 py-0.5 text-[10px] font-medium text-primary-deep">
                    {r.status}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted">{r.snippet}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
