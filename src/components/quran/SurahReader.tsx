"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, MapPin, BookOpen, Layers, X, ChevronLeft, ChevronRight, BookMarked, Rows3, Play, ListMusic } from "lucide-react";
import VerseCard from "./VerseCard";
import { useQari } from "./QariProvider";
import { useAyahPlayer } from "@/hooks/useAyahPlayer";
import { TRANSLATION_VOICES } from "@/lib/reciters";
import type { SurahFile } from "@/lib/quran";

type ReadingLang = "both" | "english" | "urdu";
const READING_LANGS: { key: ReadingLang; label: string }[] = [
  { key: "both", label: "Both" },
  { key: "english", label: "English" },
  { key: "urdu", label: "Urdu" },
];

export default function SurahReader({
  data,
  prevSurah,
  nextSurah,
}: {
  data: SurahFile;
  prevSurah: { surahNumber: number; surahName: string } | null;
  nextSurah: { surahNumber: number; surahName: string } | null;
}) {
  const { details, verses } = data;
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<ReadingLang>("both");
  const { reciter, translationVoiceOn, autoContinue } = useQari();
  const translationVoice = translationVoiceOn ? TRANSLATION_VOICES[0] ?? null : null;

  const player = useAyahPlayer({
    surahNumber: details.surahNumber,
    verses,
    reciter,
    translationVoice,
    autoContinue,
    nextSurahNumber: nextSurah?.surahNumber ?? null,
  });

  const autoplayHandled = useRef(false);
  useEffect(() => {
    if (autoplayHandled.current) return;
    autoplayHandled.current = true;
    if (new URLSearchParams(window.location.search).get("autoplay") === "1") {
      player.playFrom(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verseIndexByNumber = useMemo(() => new Map(verses.map((v, i) => [v.verseNumber, i])), [verses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return verses;
    return verses.filter(
      (v) =>
        String(v.verseNumber) === q ||
        v.verseEnglish.toLowerCase().includes(q) ||
        v.verseUrdu.includes(query.trim()) ||
        v.verse.includes(query.trim())
    );
  }, [verses, query]);

  const playingVerse = player.playingIndex !== null ? verses[player.playingIndex] : null;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 sm:px-6">
      {/* Surah header */}
      <div className="relative mt-6 overflow-hidden rounded-[var(--r-hero)] p-8 text-center sm:p-10" style={{ background: "var(--grad-hero)" }}>
        <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.16]" />
        <div className="relative">
          <p className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.82)" }}>
            Surah {details.surahNumber}
          </p>
          <p dir="rtl" className="font-arabic mt-3 text-[40px] leading-none text-white">
            {details.surahNameArabic}
          </p>
          <h1 className="mt-3 text-[22px] font-semibold text-white">
            {details.surahName} <span style={{ color: "rgba(255,255,255,0.72)" }}>· {details.surahNameTranslation}</span>
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]" style={{ color: "rgba(255,255,255,0.9)" }}>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {details.revelationPlace}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen size={14} /> {details.totalVerses} verses
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers size={14} /> {details.totalRukus} ruku{details.totalRukus > 1 ? "s" : ""}
            </span>
          </div>

          {/* Reading mode switcher */}
          <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2">
            <Link
              href={`/quran/${details.surahNumber}/read`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-transform hover:scale-[1.03]"
              style={{ background: "rgba(255,255,255,0.16)", color: "white" }}
            >
              <BookMarked size={14} /> Continuous reading
            </Link>
            <Link
              href={`/quran/${details.surahNumber}/lines`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-transform hover:scale-[1.03]"
              style={{ background: "rgba(255,255,255,0.16)", color: "white" }}
            >
              <Rows3 size={14} /> 16-line mushaf
            </Link>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[64px] z-30 -mx-5 mt-6 px-5 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--faint)" }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this surah by verse number or text…"
              className="w-full rounded-[var(--r-btn)] border py-2.5 pl-11 pr-10 text-[14.5px] outline-none transition-colors focus:border-[var(--primary)]"
              style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--muted)" }}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex shrink-0 rounded-[var(--r-btn)] border p-1" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {READING_LANGS.map((r) => {
              const active = lang === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setLang(r.key)}
                  className="rounded-[var(--r-chip)] px-3 py-1.5 text-[13px] font-semibold transition-colors"
                  style={{ background: active ? "var(--grad-btn)" : "transparent", color: active ? "var(--primary-ink)" : "var(--muted)" }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
        {query && (
          <p className="mt-2 text-[12.5px]" style={{ color: "var(--faint)" }}>
            {filtered.length} matching verse{filtered.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Verses */}
      <div className="mt-4 space-y-4">
        {filtered.map((v) => {
          const idx = verseIndexByNumber.get(v.verseNumber)!;
          const isPlaying = player.playingIndex === idx;
          return (
            <VerseCard
              key={v.verseNumber}
              surah={details.surahNumber}
              verse={v}
              readingLang={lang}
              playback={{
                isPlaying,
                isQueued: isPlaying && player.isQueue,
                isLoading: isPlaying && player.isLoading,
                onPlayOne: () => player.playOne(idx),
                onPlayFromHere: () => player.playFrom(idx),
              }}
            />
          );
        })}
        {filtered.length === 0 && (
          <p className="py-16 text-center text-[15px]" style={{ color: "var(--muted)" }}>
            No verse matches your search.
          </p>
        )}
      </div>

      {/* Prev / next */}
      <div className="mt-10 flex items-center justify-between gap-3">
        {prevSurah ? (
          <Link href={`/quran/${prevSurah.surahNumber}`} className="card-surface flex flex-1 items-center gap-2 p-4 transition-transform hover:-translate-y-0.5">
            <ChevronLeft size={18} style={{ color: "var(--primary)" }} />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--faint)" }}>Previous</p>
              <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{prevSurah.surahName}</p>
            </div>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {nextSurah ? (
          <Link href={`/quran/${nextSurah.surahNumber}`} className="card-surface flex flex-1 items-center justify-end gap-2 p-4 text-right transition-transform hover:-translate-y-0.5">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--faint)" }}>Next</p>
              <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{nextSurah.surahName}</p>
            </div>
            <ChevronRight size={18} style={{ color: "var(--primary)" }} />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>

      {/* Mini player */}
      {player.playingIndex !== null && playingVerse && (
        <div className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-3xl px-4 pb-4">
            <div
              className="flex items-center gap-3 rounded-[var(--r-card)] border px-4 py-3 backdrop-blur-xl"
              style={{ background: "color-mix(in srgb, var(--card) 92%, transparent)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--grad-btn)", color: "var(--primary-ink)" }}
              >
                {player.isQueue ? <ListMusic size={17} className="animate-pulse" /> : <Play size={16} />}
              </span>
              <a href={`#verse-${playingVerse.verseNumber}`} className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
                  Ayah {playingVerse.verseNumber === 0 ? "Bismillah" : playingVerse.verseNumber} of {details.totalVerses}
                </p>
                <p className="truncate text-[12px]" style={{ color: "var(--faint)" }}>
                  {reciter.name}
                  {reciter.style ? ` · ${reciter.style}` : ""}
                  {translationVoice ? " · with translation audio" : ""}
                </p>
              </a>
              <button
                type="button"
                onClick={player.stop}
                aria-label="Stop playback"
                className="shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                style={{ background: "var(--soft)", color: "var(--soft-text)" }}
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
