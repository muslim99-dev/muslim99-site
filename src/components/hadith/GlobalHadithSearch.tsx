"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import { SearchResultSkeleton } from "./Skeletons";
import { EmptyState } from "./StateViews";
import GradeBadge from "./GradeBadge";
import type { HadithSearchResult } from "@/lib/hadithSearch.server";

export default function GlobalHadithSearch() {
  const { language, searchOpen: open, setSearchOpen: onOpenChange } = useHadithPreferences();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HadithSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  // Global keyboard shortcuts: "/" or Cmd/Ctrl+K, ignored while typing elsewhere.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "/" && !isTyping) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else {
      setQuery("");
      setResults([]);
      setErrored(false);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setErrored(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const seq = ++requestSeq.current;
      try {
        const res = await fetch(`/api/hadith-search?q=${encodeURIComponent(trimmed)}&lang=${language}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (seq === requestSeq.current) {
          setResults(data.results ?? []);
          setErrored(false);
        }
      } catch {
        if (seq === requestSeq.current) setErrored(true);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, language]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[70]"
            style={{ background: "rgba(10, 14, 14, 0.55)", backdropFilter: "blur(2px)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 z-[71] flex h-full flex-col sm:inset-x-auto sm:left-1/2 sm:top-20 sm:h-auto sm:max-h-[70vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-[var(--r-hero)]"
            style={{ background: "var(--card)", boxShadow: "var(--shadow-xl)" }}
          >
            <div className="flex items-center gap-3 border-b p-4" style={{ borderColor: "var(--hair)" }}>
              <Search size={18} style={{ color: "var(--faint)" }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hadiths, narrators, chapters…"
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                style={{ color: "var(--text)" }}
              />
              {loading && <Loader2 size={16} className="animate-spin shrink-0" style={{ color: "var(--faint)" }} />}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--soft)", color: "var(--muted)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:max-h-[54vh]">
              {query.trim().length < 2 && (
                <EmptyState
                  title="Search the hadith collection"
                  description="Type at least 2 characters to search hadith text, narrators, chapter names, and reference numbers across all 6 books."
                />
              )}

              {query.trim().length >= 2 && loading && (
                <div className="space-y-2 p-1">
                  <SearchResultSkeleton />
                  <SearchResultSkeleton />
                  <SearchResultSkeleton />
                </div>
              )}

              {query.trim().length >= 2 && !loading && errored && (
                <EmptyState
                  title="Search is unavailable right now"
                  description="Please check your connection and try again in a moment."
                />
              )}

              {query.trim().length >= 2 && !loading && !errored && results.length === 0 && (
                <EmptyState
                  title="No hadiths found"
                  description={`Nothing matched "${query.trim()}". Try a different word, or check the spelling of a narrator's name.`}
                />
              )}

              {!loading && !errored && results.length > 0 && (
                <ul className="space-y-1.5">
                  {results.map((r) => (
                    <li key={`${r.bookSlug}-${r.hadithNumber}`}>
                      <Link
                        href={`/hadith/${r.bookSlug}/${r.chapterNumber ?? 1}#hadith-${r.hadithNumber}`}
                        onClick={() => onOpenChange(false)}
                        className="block rounded-[var(--r-card)] p-3.5 transition-colors hover:bg-[var(--card-2)]"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]" style={{ color: "var(--soft-text)" }}>
                          <span className="font-semibold">{r.bookName}</span>
                          {r.chapterName && <span style={{ color: "var(--faint)" }}>· {r.chapterName}</span>}
                          <span style={{ color: "var(--faint)" }}>· Hadith {r.hadithNumber}</span>
                          {r.grade && <GradeBadge grade={r.grade} />}
                        </div>
                        {r.narrator && (
                          <p className="mt-1 text-[12.5px] font-medium" style={{ color: "var(--text)" }}>
                            {r.narrator}
                          </p>
                        )}
                        <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                          {r.excerpt}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
