"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ayahAudioUrl, surahAudioUrl, getSurahTiming, type VerseTiming } from "@/lib/quranApi";
import { RECITERS, DEFAULT_RECITER_ID, findReciter } from "@/lib/reciters";
import { TRANSLATIONS, findTranslation } from "@/lib/translations";
import { TRANSLATION_VOICES } from "@/lib/translationVoices";

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
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER_ID);
  const [translationVoiceId, setTranslationVoiceId] = useState("");
  const [playingTranslationAyah, setPlayingTranslationAyah] = useState<number | null>(null);
  const [readWithTranslation, setReadWithTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const translationAudioRef = useRef<HTMLAudioElement | null>(null);
  const { status } = useSession();
  const reciter = findReciter(reciterId);
  const timingsRef = useRef<VerseTiming[] | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const translation = findTranslation(editionId);
  const [langFilter, setLangFilter] = useState(translation.language);
  const languages = Array.from(new Set(TRANSLATIONS.map((t) => t.language))).sort();
  const visibleTranslations = TRANSLATIONS.filter((t) => t.language === langFilter);

  function changeTranslation(id: string) {
    router.push(`${pathname}?translation=${id}`);
  }

  function changeLangFilter(lang: string) {
    setLangFilter(lang);
    const first = TRANSLATIONS.find((t) => t.language === lang);
    if (first) changeTranslation(first.id);
  }

  useEffect(() => {
    setLangFilter(translation.language);
  }, [translation.language]);

  useEffect(() => {
    const saved = localStorage.getItem("reciter");
    if (saved) setReciterId(saved);
  }, []);

  function changeReciter(id: string) {
    setReciterId(id);
    localStorage.setItem("reciter", id);
  }

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

  async function playAyah(globalNumber: number, index: number) {
    const audio = audioRef.current;
    if (!audio) return;

    if (reciter.timingRecitationId) {
      // One continuous file, but we have the exact ms range each verse
      // occupies in it — so we can seek straight to this verse and keep
      // the highlight in sync as playback continues (see the timeupdate
      // listener below), instead of only knowing "the surah is playing".
      try {
        if (!timingsRef.current || audio.dataset.timingSurah !== String(surahNumber)) {
          const { audioUrl, timings } = await getSurahTiming(reciter.timingRecitationId, surahNumber);
          audio.src = audioUrl;
          audio.dataset.timingSurah = String(surahNumber);
          timingsRef.current = timings;
        }
        const key = `${surahNumber}:${ayahs[index].numberInSurah}`;
        const t = timingsRef.current.find((v) => v.verseKey === key);
        if (t) audio.currentTime = t.from / 1000;
        setPlayingAyah(globalNumber);
        audio.play().catch(() => setPlayingAyah(null));
        audio.onended = () => setPlayingAyah(null);
      } catch {
        setPlayingAyah(null);
      }
      return;
    }

    if (reciter.mode === "surah") {
      // Only one recording exists for this reciter (the whole surah), so
      // playing "this verse" really means playing the surah from the start.
      setPlayingAyah(ayahs[0]?.globalNumber ?? globalNumber);
      audio.src = surahAudioUrl(surahNumber, reciter.id);
      audio.play().catch(() => setPlayingAyah(null));
      audio.onended = () => setPlayingAyah(null);
      return;
    }

    setPlayingAyah(globalNumber);
    audio.src = ayahAudioUrl(globalNumber, reciter.id);
    audio.play().catch(() => setPlayingAyah(null));
    audio.onended = () => {
      const goNext = () => {
        if (autoplay && index + 1 < ayahs.length) {
          playAyah(ayahs[index + 1].globalNumber, index + 1);
        } else {
          setPlayingAyah(null);
        }
      };
      // With the switch on, read the translation narration for this same
      // verse right after the recitation, then move on — so each verse
      // plays as: Arabic, then its translation, before the next verse.
      if (readWithTranslation && translationVoiceId) {
        playTranslationAyah(globalNumber, goNext);
      } else {
        goNext();
      }
    };
  }

  function playTranslationAyah(globalNumber: number, onDone?: () => void) {
    const audio = translationAudioRef.current;
    if (!audio || !translationVoiceId) return;
    setPlayingTranslationAyah(globalNumber);
    audio.src = ayahAudioUrl(globalNumber, translationVoiceId);
    audio.play().catch(() => {
      setPlayingTranslationAyah(null);
      onDone?.();
    });
    audio.onended = () => {
      setPlayingTranslationAyah(null);
      onDone?.();
    };
  }

  // For timed reciters, keep the highlighted verse in sync with actual
  // playback position instead of only marking it at the moment of seek.
  useEffect(() => {
    if (!reciter.timingRecitationId) return;
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      const timings = timingsRef.current;
      if (!timings) return;
      const ms = audio.currentTime * 1000;
      const current = timings.find((t) => ms >= t.from && ms < t.to);
      if (!current) return;
      const ayah = ayahs.find((a) => `${surahNumber}:${a.numberInSurah}` === current.verseKey);
      if (ayah) setPlayingAyah(ayah.globalNumber);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [reciter.timingRecitationId, ayahs, surahNumber]);

  // Reset cached timings when the reciter or surah changes so stale data
  // from a previous selection is never reused.
  useEffect(() => {
    timingsRef.current = null;
  }, [reciterId, surahNumber]);

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
          <select
            value={reciterId}
            onChange={(e) => changeReciter(e.target.value)}
            className="rounded-full border border-border px-3 py-1.5 bg-white text-xs max-w-[160px]"
            aria-label="Reciter"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
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

      {/* Translation language + translator — its own section, separate from
          the reciter/display controls above, since picking a language first
          then a translator within it is much easier than one 118-item list. */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-card border border-border bg-white px-4 py-3">
        <span className="text-xs font-medium text-teal-dark shrink-0">Translation language</span>
        <select
          value={langFilter}
          onChange={(e) => changeLangFilter(e.target.value)}
          className="rounded-full border border-border px-3 py-1.5 bg-white text-xs"
          aria-label="Translation language"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <select
          value={editionId}
          onChange={(e) => changeTranslation(e.target.value)}
          className="rounded-full border border-border px-3 py-1.5 bg-white text-xs flex-1 min-w-[180px]"
          aria-label="Translator"
        >
          {visibleTranslations.map((t) => (
            <option key={t.id} value={t.id}>
              {t.author}
            </option>
          ))}
        </select>
      </div>

      {/* Translation audio — a small, honestly-scoped set: pre-recorded
          narration of a translation's meaning (not Quran recitation) is
          genuinely rare content, verified working for only these 5. */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-card border border-border bg-white px-4 py-3">
        <span className="text-xs font-medium text-teal-dark shrink-0">Translation audio</span>
        <select
          value={translationVoiceId}
          onChange={(e) => setTranslationVoiceId(e.target.value)}
          className="rounded-full border border-border px-3 py-1.5 bg-white text-xs"
          aria-label="Translation audio narrator"
        >
          <option value="">None</option>
          {TRANSLATION_VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.language} — {v.narrator}
            </option>
          ))}
        </select>
        {translationVoiceId && reciter.mode === "ayah" && (
          <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs">
            <input
              type="checkbox"
              checked={readWithTranslation}
              onChange={(e) => setReadWithTranslation(e.target.checked)}
            />
            Play translation after each verse
          </label>
        )}
        {translationVoiceId && reciter.mode !== "ayah" && (
          <span className="text-[11px] text-muted">
            Tap the speaker icon on a verse to hear it narrated. (Auto-chaining after each verse needs a reciter with
            exact per-verse audio — the current one only has full-surah audio.)
          </span>
        )}
        {translationVoiceId && reciter.mode === "ayah" && !readWithTranslation && (
          <span className="text-[11px] text-muted">Or tap the speaker icon on a verse to hear it on its own.</span>
        )}
      </div>

      <p className="text-[11px] text-muted mt-3">
        Translation: {translation.author} ({translation.language}) · Reciter: {reciter.name}
        {reciter.timingRecitationId
          ? " (full-surah audio, verse-tracked)"
          : reciter.mode === "surah"
            ? " (full-surah audio — play starts from the beginning)"
            : ""}
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
                {translationVoiceId && (
                  <button
                    aria-label="Play translation narration"
                    onClick={() =>
                      playingTranslationAyah === a.globalNumber
                        ? translationAudioRef.current?.pause()
                        : playTranslationAyah(a.globalNumber)
                    }
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-aqua"
                  >
                    {playingTranslationAyah === a.globalNumber ? <PauseIcon /> : <SpeakerIcon />}
                  </button>
                )}
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
      <audio ref={translationAudioRef} className="hidden" />
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
function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" strokeLinejoin="round" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
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
