"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Info, ChevronLeft, ChevronRight, ListMusic, Play, Languages } from "lucide-react";
import { useQari } from "./QariProvider";
import { useAyahPlayer } from "@/hooks/useAyahPlayer";
import { TRANSLATION_VOICES } from "@/lib/reciters";
import ReadingModeSwitcher from "./ReadingModeSwitcher";
import { cleanVerseText, type SurahFile, type VerseBase } from "@/lib/quran";

// Approximate characters-per-line at the fixed reading size below, tuned for
// a ~680px page width. This is a heuristic page-break — not a reproduction
// of any certified printed 16-line Indo-Pak mushaf, which relies on a
// precise per-word line-break dataset we don't have. Whole ayat are always
// kept together on one page.
const CHARS_PER_LINE = 60;
const LINES_PER_PAGE = 16;
const MAX_CHARS_PER_PAGE = CHARS_PER_LINE * LINES_PER_PAGE;

function paginate(verses: VerseBase[]): VerseBase[][] {
  const pages: VerseBase[][] = [];
  let current: VerseBase[] = [];
  let currentLen = 0;

  for (const v of verses) {
    const len = cleanVerseText(v.verse).length + 1;
    if (current.length > 0 && currentLen + len > MAX_CHARS_PER_PAGE) {
      pages.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(v);
    currentLen += len;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

export default function MushafLines({
  data,
  prevSurah,
  nextSurah,
}: {
  data: SurahFile;
  prevSurah: { surahNumber: number; surahName: string } | null;
  nextSurah: { surahNumber: number; surahName: string } | null;
}) {
  const { details, verses } = data;
  const pages = useMemo(() => paginate(verses), [verses]);
  const [pageIdx, setPageIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const { reciter, translationVoiceOn, autoContinue } = useQari();
  const translationVoice = translationVoiceOn ? TRANSLATION_VOICES[0] ?? null : null;

  const player = useAyahPlayer({
    surahNumber: details.surahNumber,
    verses,
    reciter,
    translationVoice,
    autoContinue,
    nextSurahNumber: nextSurah?.surahNumber ?? null,
    nextSurahPathTemplate: (s) => `/quran/${s}/lines`,
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
  const playingVerseNumber = player.playingIndex !== null ? verses[player.playingIndex]?.verseNumber ?? null : null;

  const page = pages[pageIdx] ?? [];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 sm:px-6">
      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--faint)" }}>
            16-line reading style
          </p>
          <h1 className="mt-0.5 text-[20px] font-semibold" style={{ color: "var(--text)" }}>
            {details.surahName} <span style={{ color: "var(--soft-text)" }}>· {details.surahNameArabic}</span>
          </h1>
        </div>
        <ReadingModeSwitcher surahNumber={details.surahNumber} active="lines" />
      </div>

      <div
        className="mt-4 flex items-start gap-2.5 rounded-[var(--r-card)] p-3.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--gold-soft)", color: "var(--text)" }}
      >
        <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
        <p>
          A clean, ~16-lines-per-page reading layout in the spirit of the traditional Indo-Pak mus-haf. Page
          breaks here are estimated for comfortable reading, not a certified pixel match of a printed
          16-line Quran — ayat are always kept whole and never split across pages.
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-[64px] z-30 -mx-5 mt-4 flex flex-wrap items-center gap-2 px-5 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
        <div className="flex items-center gap-1.5 rounded-[var(--r-btn)] border px-1 py-1" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
            disabled={pageIdx === 0}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--r-chip)] disabled:opacity-30"
            style={{ color: "var(--muted)" }}
          >
            <ChevronRight size={16} />
          </button>
          <span className="min-w-[5.5rem] text-center text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>
            Page {pageIdx + 1} of {pages.length}
          </span>
          <button
            type="button"
            onClick={() => setPageIdx((p) => Math.min(pages.length - 1, p + 1))}
            disabled={pageIdx === pages.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--r-chip)] disabled:opacity-30"
            style={{ color: "var(--muted)" }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-[var(--r-btn)] border px-3 py-2 text-[12.5px] font-semibold"
          style={{
            background: showTranslation ? "var(--soft)" : "var(--card)",
            borderColor: "var(--border)",
            color: showTranslation ? "var(--soft-text)" : "var(--muted)",
          }}
        >
          <Languages size={14} /> Translation
        </button>

        <button
          type="button"
          onClick={() => (player.isQueue ? player.stop() : player.playFrom(0))}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-transform hover:scale-[1.03]"
          style={{ background: "var(--grad-btn)", color: "var(--primary-ink)" }}
        >
          <ListMusic size={14} /> {player.isQueue ? "Stop" : "Play surah"}
        </button>
      </div>

      {/* Page */}
      <div className="card-surface relative mt-5 overflow-hidden p-7 sm:p-10">
        <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.06]" />
        <div className="relative">
          <p dir="rtl" lang="ar" className="font-arabic text-justify text-[26px] leading-[2.5] sm:text-[28px]" style={{ color: "var(--text)" }}>
            {page.map((v) => {
              const isPlaying = playingVerseNumber === v.verseNumber;
              const idx = verseIndexByNumber.get(v.verseNumber)!;
              return (
                <span
                  key={v.verseNumber}
                  onClick={() => player.playOne(idx)}
                  className="cursor-pointer rounded transition-colors"
                  style={isPlaying ? { background: "var(--soft)", boxShadow: "0 0 0 2px var(--primary)" } : undefined}
                >
                  {cleanVerseText(v.verse)}{" "}
                </span>
              );
            })}
          </p>

          <p className="mt-6 text-center text-[11.5px] font-medium" style={{ color: "var(--faint)" }}>
            {details.surahName} &middot; Page {pageIdx + 1}
          </p>
        </div>
      </div>

      {showTranslation && (
        <div className="card-surface mt-4 space-y-2.5 p-6">
          {page.map((v) => (
            <p key={v.verseNumber} className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
              <span className="mr-1.5 text-[11px] font-semibold" style={{ color: "var(--soft-text)" }}>
                {v.verseNumber === 0 ? "—" : v.verseNumber}
              </span>
              {v.verseEnglish}
            </p>
          ))}
        </div>
      )}

      {/* Page navigation */}
      <div className="mt-5 flex items-center justify-between gap-3">
        {pageIdx > 0 ? (
          <button
            type="button"
            onClick={() => setPageIdx((p) => p - 1)}
            className="card-surface flex flex-1 items-center gap-2 p-4 transition-transform hover:-translate-y-0.5"
          >
            <ChevronRight size={18} style={{ color: "var(--primary)" }} />
            <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Previous page</span>
          </button>
        ) : prevSurah ? (
          <Link href={`/quran/${prevSurah.surahNumber}/lines`} className="card-surface flex flex-1 items-center gap-2 p-4 transition-transform hover:-translate-y-0.5">
            <ChevronRight size={18} style={{ color: "var(--primary)" }} />
            <span className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{prevSurah.surahName}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {pageIdx < pages.length - 1 ? (
          <button
            type="button"
            onClick={() => setPageIdx((p) => p + 1)}
            className="card-surface flex flex-1 items-center justify-end gap-2 p-4 text-right transition-transform hover:-translate-y-0.5"
          >
            <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Next page</span>
            <ChevronLeft size={18} style={{ color: "var(--primary)" }} />
          </button>
        ) : nextSurah ? (
          <Link href={`/quran/${nextSurah.surahNumber}/lines`} className="card-surface flex flex-1 items-center justify-end gap-2 p-4 text-right transition-transform hover:-translate-y-0.5">
            <span className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{nextSurah.surahName}</span>
            <ChevronLeft size={18} style={{ color: "var(--primary)" }} />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>

      {/* Mini player */}
      {player.playingIndex !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-3xl px-4 pb-4">
            <div
              className="flex items-center gap-3 rounded-[var(--r-card)] border px-4 py-3 backdrop-blur-xl"
              style={{ background: "color-mix(in srgb, var(--card) 92%, transparent)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--grad-btn)", color: "var(--primary-ink)" }}>
                {player.isQueue ? <ListMusic size={17} className="animate-pulse" /> : <Play size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
                  Ayah {playingVerseNumber === 0 ? "Bismillah" : playingVerseNumber} of {details.totalVerses}
                </p>
                <p className="truncate text-[12px]" style={{ color: "var(--faint)" }}>
                  {reciter.name}
                  {reciter.style ? ` · ${reciter.style}` : ""}
                </p>
              </div>
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
