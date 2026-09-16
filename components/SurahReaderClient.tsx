"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ayahAudioUrl, TRANSLATION_EDITIONS } from "@/lib/quranApi";

type AyahRow = { numberInSurah: number; globalNumber: number; arabic: string; translation: string };

export default function SurahReaderClient({
  surahNumber,
  englishName,
  arabicName,
  ayahs,
  editionId
}: {
  surahNumber: number;
  englishName: string;
  arabicName: string;
  ayahs: AyahRow[];
  editionId: string;
}) {
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(30);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => {
        const refs = (d.bookmarks ?? [])
          .filter((b: { type: string }) => b.type === "AYAH")
          .map((b: { refId: string }) => b.refId);
        setBookmarked(new Set(refs));
      })
      .catch(() => {});
  }, [status]);

  async function toggleBookmark(numberInSurah: number) {
    const refId = `${surahNumber}:${numberInSurah}`;
    if (status !== "authenticated") {
      window.location.href = "/auth/signin";
      return;
    }
    const isBookmarked = bookmarked.has(refId);
    setBookmarked((prev) => {
      const next = new Set(prev);
      isBookmarked ? next.delete(refId) : next.add(refId);
      return next;
    });
    await fetch("/api/bookmarks", {
      method: isBookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "AYAH", refId })
    });
  }

  function playAyah(globalNumber: number, index: number) {
    setPlayingAyah(globalNumber);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = ayahAudioUrl(globalNumber);
    audio.play().catch(() => setPlayingAyah(null));
    audio.onended = () => {
      if (autoplay && index + 1 < ayahs.length) {
        playAyah(ayahs[index + 1].globalNumber, index + 1);
      } else {
        setPlayingAyah(null);
      }
    };
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-16 z-30 -mx-5 sm:mx-0 border-b border-border bg-bg/95 backdrop-blur px-5 sm:px-0 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/quran" className="text-xs text-primary-deep">
            ← All Surahs
          </Link>
          <p className="font-medium text-teal-dark">
            {surahNumber}. {englishName}{" "}
            <span dir="rtl" className="font-quran text-lg">
              {arabicName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <button onClick={() => setFontSize((s) => Math.max(20, s - 2))} className="h-8 w-8 rounded-full border border-border">
            A-
          </button>
          <button onClick={() => setFontSize((s) => Math.min(44, s + 2))} className="h-8 w-8 rounded-full border border-border">
            A+
          </button>
          <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
            <input type="checkbox" checked={showTranslation} onChange={(e) => setShowTranslation(e.target.checked)} />
            Translation
          </label>
          <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
            <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
            Autoplay
          </label>
        </div>
      </div>

      <p className="text-[11px] text-muted mt-3">
        Translation: {TRANSLATION_EDITIONS.find((e) => e.id === editionId)?.label ?? editionId}
      </p>

      {/* Ayahs */}
      <div className="mt-6 space-y-6">
        {ayahs.map((a, i) => (
          <div
            key={a.globalNumber}
            className={`rounded-card border p-5 transition-colors ${
              playingAyah === a.globalNumber ? "bg-aqua/50 border-primary" : "bg-white border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-aqua text-[11px] font-medium text-primary-deep">
                {a.numberInSurah}
              </span>
              <div className="flex items-center gap-1.5 text-muted">
                <button
                  aria-label="Play ayah"
                  onClick={() => (playingAyah === a.globalNumber ? audioRef.current?.pause() : playAyah(a.globalNumber, i))}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-aqua"
                >
                  {playingAyah === a.globalNumber ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  aria-label="Bookmark ayah"
                  onClick={() => toggleBookmark(a.numberInSurah)}
                  className={`grid h-8 w-8 place-items-center rounded-full hover:bg-aqua ${
                    bookmarked.has(`${surahNumber}:${a.numberInSurah}`) ? "text-primary-deep" : ""
                  }`}
                >
                  <BookmarkIcon filled={bookmarked.has(`${surahNumber}:${a.numberInSurah}`)} />
                </button>
                <button aria-label="Copy ayah" className="grid h-8 w-8 place-items-center rounded-full hover:bg-aqua">
                  <CopyIcon />
                </button>
              </div>
            </div>
            <p dir="rtl" style={{ fontSize }} className="font-quran text-teal-dark mt-4 text-right">
              {a.arabic}
            </p>
            {showTranslation && <p className="mt-3 text-[15px] leading-relaxed text-muted">{a.translation}</p>}
          </div>
        ))}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}
function BookmarkIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3.5h12v17l-6-4-6 4v-17Z" strokeLinejoin="round" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M5 15.5H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10.5a1 1 0 0 1 1 1v1" />
    </svg>
  );
}
