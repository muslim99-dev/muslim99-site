"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Type, Play, Pause, ListMusic, ChevronLeft, ChevronRight } from "lucide-react";
import { useQari } from "./QariProvider";
import { useAyahPlayer } from "@/hooks/useAyahPlayer";
import ReadingModeSwitcher from "./ReadingModeSwitcher";
import { cleanVerseText, type SurahFile } from "@/lib/quran";

type TranslationLang = "off" | "english" | "urdu" | "both";
const TRANSLATION_OPTIONS: { key: TranslationLang; label: string }[] = [
  { key: "off", label: "Arabic only" },
  { key: "english", label: "English" },
  { key: "urdu", label: "Urdu" },
  { key: "both", label: "Both" },
];

type FontSize = "base" | "lg";

export default function ContinuousReader({
  data,
  prevSurah,
  nextSurah,
}: {
  data: SurahFile;
  prevSurah: { surahNumber: number; surahName: string } | null;
  nextSurah: { surahNumber: number; surahName: string } | null;
}) {
  const { details, verses } = data;
  const [translationLang, setTranslationLang] = useState<TranslationLang>("english");
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const { reciter, translationVoice, autoContinue } = useQari();

  const player = useAyahPlayer({
    surahNumber: details.surahNumber,
    verses,
    reciter,
    translationVoice,
    autoContinue,
    nextSurahNumber: nextSurah?.surahNumber ?? null,
    nextSurahPathTemplate: (s) => `/quran/${s}/read`,
  });

  // Keyed by surah number (not a plain boolean) because Next.js reuses this
  // component across surah navigations instead of remounting it — a plain
  // "have I handled autoplay yet" flag would only ever fire once per page
  // load and silently break auto-continue into the next surah.
  const autoplayHandledFor = useRef<number | null>(null);
  useEffect(() => {
    if (autoplayHandledFor.current === details.surahNumber) return;
    autoplayHandledFor.current = details.surahNumber;
    if (new URLSearchParams(window.location.search).get("autoplay") === "1") {
      player.playFrom(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.surahNumber]);

  const arabicSize = fontSize === "lg" ? "text-[30px] sm:text-[34px]" : "text-[24px] sm:text-[27px]";

  const showEnglish = translationLang === "english" || translationLang === "both";
  const showUrdu = translationLang === "urdu" || translationLang === "both";

  const playingVerseNumber = useMemo(
    () => (player.playingIndex !== null ? verses[player.playingIndex]?.verseNumber ?? null : null),
    [player.playingIndex, verses]
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-28 sm:px-6">
      {/* Header strip */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--faint)" }}>
            Continuous reading
          </p>
          <h1 className="mt-0.5 text-[20px] font-semibold" style={{ color: "var(--text)" }}>
            {details.surahName} <span style={{ color: "var(--soft-text)" }}>· {details.surahNameArabic}</span>
          </h1>
        </div>
        <ReadingModeSwitcher surahNumber={details.surahNumber} active="read" />
      </div>

      {/* Controls */}
      <div className="sticky top-[80px] z-30 -mx-5 mt-5 flex flex-wrap items-center gap-2 px-5 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
        <div className="flex rounded-[var(--r-btn)] border p-1" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {TRANSLATION_OPTIONS.map((o) => {
            const active = translationLang === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setTranslationLang(o.key)}
                className="rounded-[var(--r-chip)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
                style={{ background: active ? "var(--grad-btn)" : "transparent", color: active ? "var(--primary-ink)" : "var(--muted)" }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setFontSize((s) => (s === "base" ? "lg" : "base"))}
          className="inline-flex items-center gap-1.5 rounded-[var(--r-btn)] border px-3 py-2 text-[12.5px] font-semibold"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
        >
          <Type size={14} /> {fontSize === "lg" ? "Large" : "Normal"}
        </button>

        <button
          type="button"
          onClick={() => (player.isQueue ? player.stop() : player.playFrom(0))}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-transform hover:scale-[1.03]"
          style={{ background: "var(--grad-btn)", color: "var(--primary-ink)" }}
        >
          {player.isQueue ? (
            <>
              <Pause size={14} /> Stop
            </>
          ) : (
            <>
              <ListMusic size={14} /> Play surah
            </>
          )}
        </button>
      </div>

      {/* Flowing mushaf-style Arabic, with each ayah's translation shown right beneath it */}
      <div className="card-surface mt-5 overflow-hidden">
        {verses.map((v, i) => {
          const isPlaying = playingVerseNumber === v.verseNumber;
          return (
            <div
              key={v.verseNumber}
              id={`aya-${v.verseNumber}`}
              className="scroll-mt-24 border-b px-6 py-5 transition-colors last:border-b-0 sm:px-9"
              style={{
                borderColor: "var(--hair)",
                background: isPlaying ? "var(--soft)" : "transparent",
              }}
            >
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  onClick={() => player.playOne(i)}
                  aria-label={`Play ayah ${v.verseNumber}`}
                  className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-transform hover:scale-105"
                  style={{
                    background: isPlaying ? "var(--primary)" : "var(--soft)",
                    color: isPlaying ? "var(--primary-ink)" : "var(--primary)",
                  }}
                >
                  {v.verseNumber === 0 ? "﷽" : v.verseNumber}
                </button>
                <div className="min-w-0 flex-1">
                  <p dir="rtl" lang="ar" className={`font-arabic text-justify leading-[2.15] ${arabicSize}`} style={{ color: "var(--text)" }}>
                    {cleanVerseText(v.verse)}
                  </p>
                  {translationLang !== "off" && v.verseNumber !== 0 && (
                    <div className="mt-3.5 space-y-2 border-l-2 pl-3.5" style={{ borderColor: "var(--primary)" }}>
                      {showEnglish && (
                        <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                          {v.verseEnglish}
                        </p>
                      )}
                      {showUrdu && (
                        <p dir="rtl" lang="ur" className="font-urdu text-[17px] leading-[1.9]" style={{ color: "var(--muted)" }}>
                          {v.verseUrdu}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / next */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {prevSurah ? (
          <Link href={`/quran/${prevSurah.surahNumber}/read`} className="card-surface flex flex-1 items-center gap-2 p-4 transition-transform hover:-translate-y-0.5">
            <ChevronLeft size={18} style={{ color: "var(--primary)" }} />
            <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{prevSurah.surahName}</p>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {nextSurah ? (
          <Link href={`/quran/${nextSurah.surahNumber}/read`} className="card-surface flex flex-1 items-center justify-end gap-2 p-4 text-right transition-transform hover:-translate-y-0.5">
            <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{nextSurah.surahName}</p>
            <ChevronRight size={18} style={{ color: "var(--primary)" }} />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>

      {/* Mini player */}
      {player.playingIndex !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-[1200px] px-4 pb-4">
            <div
              className="flex items-center gap-3 rounded-[var(--r-card)] border px-4 py-3 backdrop-blur-xl"
              style={{ background: "color-mix(in srgb, var(--card) 92%, transparent)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--grad-btn)", color: "var(--primary-ink)" }}>
                {player.isQueue ? <ListMusic size={17} className="animate-pulse" /> : <Play size={16} />}
              </span>
              <a href={`#aya-${playingVerseNumber}`} className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
                  Ayah {playingVerseNumber === 0 ? "Bismillah" : playingVerseNumber} of {details.totalVerses}
                </p>
                <p className="truncate text-[12px]" style={{ color: "var(--faint)" }}>
                  {reciter.name}
                  {reciter.style ? ` · ${reciter.style}` : ""}
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
