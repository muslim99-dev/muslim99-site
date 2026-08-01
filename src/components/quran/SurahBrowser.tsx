"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, BookOpen, X, Play, Pause, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { SurahSummary, RevelationPlace } from "@/lib/quran";
import { cleanVerseText } from "@/lib/quran";
import { ayahAudioUrl } from "@/lib/reciters";
import { useQari } from "./QariProvider";
import QariSelector from "./QariSelector";
import type { GlobalVerseMatch, MatchLanguage } from "@/lib/quranGlobalSearch.server";

type PlaceFilter = "All" | RevelationPlace;

const PLACE_FILTERS: PlaceFilter[] = ["All", "Meccan", "Medinan"];
const SURAHS_PER_PAGE = 9;

const LANGUAGE_LABELS: Record<MatchLanguage, string> = {
  arabic: "Arabic",
  english: "English",
  urdu: "Urdu",
  hindi: "Hindi",
};

export default function SurahBrowser({ surahs }: { surahs: SurahSummary[] }) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<PlaceFilter>("All");

  const [verseMatches, setVerseMatches] = useState<GlobalVerseMatch[]>([]);
  const [verseSearchLoading, setVerseSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 2) {
      setVerseMatches([]);
      setVerseSearchLoading(false);
      return;
    }

    setVerseSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      const seq = ++requestSeq.current;
      try {
        const res = await fetch(`/api/quran-search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (seq === requestSeq.current) setVerseMatches(data.matches ?? []);
      } catch {
        if (seq === requestSeq.current) setVerseMatches([]);
      } finally {
        if (seq === requestSeq.current) setVerseSearchLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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

  const showVerseSection = query.trim().length >= 2;

  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / SURAHS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pagedSurahs = filtered.slice((safePage - 1) * SURAHS_PER_PAGE, safePage * SURAHS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [query, place]);

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
            placeholder="Search the whole Quran — Arabic, English, Urdu or Hindi…"
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

        <QariSelector />
      </div>

      {/* Verse search results — whole-Quran match, no need to open a surah first */}
      {showVerseSection && (
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
              Verses matching &ldquo;{query.trim()}&rdquo;
            </h2>
            {verseSearchLoading && <Loader2 size={13} className="animate-spin" style={{ color: "var(--faint)" }} />}
          </div>

          {!verseSearchLoading && verseMatches.length === 0 && (
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
              No verses match this word in Arabic, English, Urdu, or Hindi.
            </p>
          )}

          <div className="mt-3 space-y-3">
            {verseMatches.map((v) => (
              <VerseMatchCard key={`${v.surahNumber}-${v.verseNumber}`} match={v} rawQuery={query.trim()} />
            ))}
          </div>
        </div>
      )}

      <p className="mx-auto mt-6 max-w-3xl text-[13px]" style={{ color: "var(--faint)" }}>
        Showing {pagedSurahs.length === 0 ? 0 : (safePage - 1) * SURAHS_PER_PAGE + 1}
        {"–"}
        {Math.min(safePage * SURAHS_PER_PAGE, filtered.length)} of {filtered.length} surahs
      </p>

      {/* Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {pagedSurahs.map((s, i) => (
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
              .map((n, idx, arr) => (
                <span key={n} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== n - 1 && (
                    <span className="px-1.5 text-[13px]" style={{ color: "var(--faint)" }}>
                      …
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={n === safePage ? "page" : undefined}
                    className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[13.5px] font-semibold transition-colors"
                    style={{
                      background: n === safePage ? "var(--grad-btn)" : "var(--card)",
                      color: n === safePage ? "var(--primary-ink)" : "var(--muted)",
                      border: n === safePage ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {n}
                  </button>
                </span>
              ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage === pageCount}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {filtered.length === 0 && !showVerseSection && (
        <div className="mt-16 text-center">
          <p className="text-[15px]" style={{ color: "var(--muted)" }}>
            No surah matches &ldquo;{query}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

function highlightPlain(text: string, rawQuery: string): React.ReactNode {
  if (!rawQuery) return text;
  const idx = text.toLowerCase().indexOf(rawQuery.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "var(--gold-soft)", color: "var(--text)" }}>{text.slice(idx, idx + rawQuery.length)}</mark>
      {text.slice(idx + rawQuery.length)}
    </>
  );
}

function VerseMatchCard({ match, rawQuery }: { match: GlobalVerseMatch; rawQuery: string }) {
  const { reciter } = useQari();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      setLoading(true);
      el.play().catch(() => setLoading(false));
    }
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/quran/${match.surahNumber}#verse-${match.verseNumber}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: "var(--soft)", color: "var(--primary)" }}
            >
              {match.verseNumber === 0 ? "﷽" : match.verseNumber}
            </span>
            <span className="truncate text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
              {match.surahName}
            </span>
            <span dir="rtl" className="font-arabic shrink-0 text-[13px]" style={{ color: "var(--soft-text)" }}>
              {match.surahNameArabic}
            </span>
            <span className="shrink-0 text-[11.5px]" style={{ color: "var(--faint)" }}>
              {match.surahNumber}:{match.verseNumber}
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {match.matchedIn.map((lang) => (
            <span
              key={lang}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
            >
              {LANGUAGE_LABELS[lang]}
            </span>
          ))}
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause recitation" : "Play this ayah"}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "var(--soft)", color: "var(--primary)" }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : playing ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <audio
            ref={audioRef}
            src={ayahAudioUrl(reciter, match.surahNumber, match.verseNumber)}
            preload="none"
            onPlay={() => {
              setPlaying(true);
              setLoading(false);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => {
              setPlaying(false);
              setLoading(false);
            }}
          />
        </div>
      </div>

      <p dir="rtl" lang="ar" className="font-arabic mt-3 text-[19px] leading-[2]" style={{ color: "var(--text)" }}>
        {cleanVerseText(match.verse)}
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        {highlightPlain(match.verseEnglish, match.matchedIn.includes("english") ? rawQuery : "")}
      </p>
      {match.matchedIn.includes("urdu") && (
        <p dir="rtl" lang="ur" className="font-arabic mt-1.5 text-[15.5px] leading-[1.9]" style={{ color: "var(--muted)" }}>
          {match.verseUrdu}
        </p>
      )}
      {match.verseHindi && match.matchedIn.includes("hindi") && (
        <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {highlightPlain(match.verseHindi, rawQuery)}
        </p>
      )}
    </div>
  );
}
