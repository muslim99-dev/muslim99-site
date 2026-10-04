"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ayahAudioUrl, surahAudioUrl, getSurahTiming, type VerseTiming } from "@/lib/quranApi";
import { RECITERS, DEFAULT_RECITER_ID, findReciter } from "@/lib/reciters";
import { findTranslation } from "@/lib/translations";
import TranslationChooser from "@/components/TranslationChooser";
import { TRANSLATION_VOICES } from "@/lib/translationVoices";

type AyahRow = { numberInSurah: number; globalNumber: number; arabic: string; translation: string };

/**
 * Recitation modes
 * - "verse":      play the chosen ayah, then stop.
 * - "continuous": recite on to the end of the surah, highlighting and
 *                 following each ayah as it is recited.
 *
 * How each works depends on what audio exists for the reciter:
 * - per-verse files (mode "ayah"): one file per ayah — verse-by-verse
 *   plays exactly that file; continuous chains them.
 * - timed full-surah file (timingRecitationId): one recording plus exact
 *   per-ayah timestamps — verse-by-verse plays that ayah's span and stops;
 *   continuous plays gaplessly and tracks the ayah from the timestamps.
 * - full-surah file only: no verse boundaries exist, so only continuous
 *   playback of the whole surah is possible, without tracking.
 */
type Mode = "verse" | "continuous";

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
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER_ID);
  const [translationVoiceId, setTranslationVoiceId] = useState("");
  const [playingTranslationAyah, setPlayingTranslationAyah] = useState<number | null>(null);
  const [readWithTranslation, setReadWithTranslation] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  // Player state
  const [mode, setMode] = useState<Mode>("continuous");
  const [follow, setFollow] = useState(true);
  const [current, setCurrent] = useState<number | null>(null); // index into ayahs
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [untracked, setUntracked] = useState(false); // whole-surah audio with no verse positions

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const translationAudioRef = useRef<HTMLAudioElement | null>(null);
  const timingsRef = useRef<{ key: string; url: string; list: VerseTiming[] } | null>(null);
  const usingTimingRef = useRef(false); // current audio is the timed surah file
  const stopAtRef = useRef<number | null>(null); // ms; verse-by-verse end point in the timed file
  const sessionRef = useRef(0); // bumps on every new play request, cancelling stale chains
  const resumableRef = useRef(false); // paused mid-way (vs. finished)

  const { status } = useSession();
  const reciter = findReciter(reciterId);
  const hasVerseFiles = reciter.mode === "ayah";
  const hasTiming = !!reciter.timingRecitationId;
  const canVerse = hasVerseFiles || hasTiming;
  const effectiveMode: Mode = canVerse ? mode : "continuous";

  const router = useRouter();
  const pathname = usePathname();
  const translation = findTranslation(editionId);
  const translationRtl = ["Urdu", "Arabic", "Persian", "Pashto", "Sindhi", "Uyghur", "Divehi"].includes(translation.language);

  function changeTranslation(id: string) {
    router.push(`${pathname}?translation=${id}`);
  }

  // Saved preferences (per browser).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reciter");
      if (saved) setReciterId(saved);
      const m = localStorage.getItem("recitation-mode");
      if (m === "verse" || m === "continuous") setMode(m);
      if (localStorage.getItem("recitation-follow") === "off") setFollow(false);
    } catch {}
  }, []);

  // Arriving with #ayah-N (e.g. from a tafsir page) selects that ayah.
  useEffect(() => {
    const m = window.location.hash.match(/^#ayah-(\d+)$/);
    if (!m) return;
    const i = ayahs.findIndex((a) => a.numberInSurah === Number(m[1]));
    if (i >= 0) {
      setCurrent(i);
      setTimeout(() => document.getElementById(`ayah-${ayahs[i].numberInSurah}`)?.scrollIntoView({ block: "center" }), 300);
    }
  }, [ayahs]);

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
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`${pathname}#ayah-${numberInSurah}`)}`;
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

  async function copyAyah(a: AyahRow) {
    const text = [a.arabic, a.translation, `— Qur'an ${surahNumber}:${a.numberInSurah} (${englishName})`].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(a.globalNumber);
      setTimeout(() => setCopied(null), 1600);
    } catch {}
  }

  // ------------------------------------------------------------ audio engine

  const stopAll = useCallback(() => {
    sessionRef.current++;
    stopAtRef.current = null;
    resumableRef.current = false;
    audioRef.current?.pause();
    translationAudioRef.current?.pause();
    setPlayingTranslationAyah(null);
    setIsPlaying(false);
    setLoading(false);
  }, []);

  async function ensureTimings() {
    const key = `${reciter.timingRecitationId}:${surahNumber}`;
    if (timingsRef.current?.key !== key) {
      const { audioUrl, timings } = await getSurahTiming(reciter.timingRecitationId!, surahNumber);
      timingsRef.current = { key, url: audioUrl, list: timings };
    }
    return timingsRef.current!;
  }

  function timingFor(index: number) {
    const key = `${surahNumber}:${ayahs[index].numberInSurah}`;
    return timingsRef.current?.list.find((t) => t.verseKey === key);
  }

  /** Plays a single file (per-verse audio) and resolves when it ends. */
  function playFile(url: string, session: number) {
    const audio = audioRef.current!;
    usingTimingRef.current = false;
    stopAtRef.current = null;
    audio.src = url;
    return new Promise<"ended" | "failed">((resolve) => {
      audio.onended = () => resolve("ended");
      audio.onerror = () => resolve("failed");
      audio.play().catch(() => resolve("failed"));
    }).then((r) => (session === sessionRef.current ? r : "failed"));
  }

  function narrate(globalNumber: number, session: number) {
    return new Promise<void>((resolve) => {
      const t = translationAudioRef.current;
      if (!t || !translationVoiceId || session !== sessionRef.current) return resolve();
      setPlayingTranslationAyah(globalNumber);
      t.src = ayahAudioUrl(globalNumber, translationVoiceId);
      const done = () => {
        setPlayingTranslationAyah(null);
        resolve();
      };
      t.onended = done;
      t.onerror = done;
      t.play().catch(done);
    });
  }

  async function playFrom(index: number) {
    if (index < 0 || index >= ayahs.length) return;
    const audio = audioRef.current;
    if (!audio) return;
    translationAudioRef.current?.pause();
    setPlayingTranslationAyah(null);
    const session = ++sessionRef.current;
    resumableRef.current = false;
    setUntracked(false);
    setCurrent(index);

    const withNarration = readWithTranslation && !!translationVoiceId && hasVerseFiles;

    // Timed full-surah file: verse-by-verse (seek + stop at the ayah end) or
    // gapless continuous — unless narration must be interleaved per verse.
    if (hasTiming && !withNarration && (effectiveMode === "continuous" || !hasVerseFiles)) {
      setLoading(true);
      try {
        const timing = await ensureTimings();
        if (session !== sessionRef.current) return;
        if (audio.src !== timing.url) audio.src = timing.url;
        usingTimingRef.current = true;
        const t = timingFor(index);
        stopAtRef.current = effectiveMode === "verse" && t ? t.to : null;
        audio.onended = () => {
          if (session === sessionRef.current) setIsPlaying(false);
        };
        audio.onerror = null;
        const seek = () => {
          if (t) audio.currentTime = t.from / 1000;
        };
        if (audio.readyState >= 1) seek();
        else audio.addEventListener("loadedmetadata", seek, { once: true });
        await audio.play();
        // Verse by verse: stop exactly at the ayah's end. timeupdate only
        // fires ~4×/s, which would bleed into the next ayah — check per frame.
        if (stopAtRef.current !== null) {
          const watch = () => {
            if (session !== sessionRef.current || stopAtRef.current === null) return;
            if (audio.currentTime * 1000 >= stopAtRef.current - 40) {
              stopAtRef.current = null;
              resumableRef.current = false;
              audio.pause();
              return;
            }
            requestAnimationFrame(watch);
          };
          requestAnimationFrame(watch);
        }
      } catch {
        if (session === sessionRef.current) setIsPlaying(false);
      } finally {
        if (session === sessionRef.current) setLoading(false);
      }
      return;
    }

    // Per-verse files.
    if (hasVerseFiles) {
      let i = index;
      while (session === sessionRef.current && i < ayahs.length) {
        setCurrent(i);
        const r = await playFile(ayahAudioUrl(ayahs[i].globalNumber, reciter.id), session);
        if (r !== "ended") break;
        if (withNarration) await narrate(ayahs[i].globalNumber, session);
        if (effectiveMode === "verse") break;
        i++;
      }
      if (session === sessionRef.current) setIsPlaying(false);
      return;
    }

    // Whole-surah audio only — no verse positions to seek to or track.
    usingTimingRef.current = false;
    stopAtRef.current = null;
    setUntracked(true);
    setCurrent(null);
    audio.src = surahAudioUrl(surahNumber, reciter.id);
    audio.onended = () => {
      if (session === sessionRef.current) setIsPlaying(false);
    };
    audio.play().catch(() => setIsPlaying(false));
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      resumableRef.current = true;
      return;
    }
    if (resumableRef.current && audio.src) {
      resumableRef.current = false;
      audio.play().catch(() => {});
      return;
    }
    playFrom(current ?? 0);
  }

  function playTranslationAyah(globalNumber: number) {
    const audio = translationAudioRef.current;
    if (!audio || !translationVoiceId) return;
    setPlayingTranslationAyah(globalNumber);
    audio.src = ayahAudioUrl(globalNumber, translationVoiceId);
    audio.onended = () => setPlayingTranslationAyah(null);
    audio.play().catch(() => setPlayingTranslationAyah(null));
  }

  // Playing state + live tracking of the timed file.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => {
      if (audio.paused || !usingTimingRef.current || !timingsRef.current) return;
      const ms = audio.currentTime * 1000;
      if (stopAtRef.current !== null && ms >= stopAtRef.current) {
        stopAtRef.current = null;
        resumableRef.current = false;
        audio.pause();
        return;
      }
      const t = timingsRef.current.list.find((v) => ms >= v.from && ms < v.to);
      if (!t) return;
      const i = ayahs.findIndex((a) => `${surahNumber}:${a.numberInSurah}` === t.verseKey);
      if (i >= 0) setCurrent((prev) => (prev === i ? prev : i));
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [ayahs, surahNumber]);

  // Follow the recited ayah on screen.
  useEffect(() => {
    if (!follow || !isPlaying || current === null) return;
    document.getElementById(`ayah-${ayahs[current].numberInSurah}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current, follow, isPlaying, ayahs]);

  // A new reciter or surah invalidates the loaded audio and timings.
  useEffect(() => {
    stopAll();
    timingsRef.current = null;
    usingTimingRef.current = false;
    setUntracked(false);
  }, [reciterId, surahNumber, stopAll]);

  function changeReciter(id: string) {
    setReciterId(id);
    try {
      localStorage.setItem("reciter", id);
    } catch {}
  }

  function changeMode(m: Mode) {
    stopAll();
    setMode(m);
    try {
      localStorage.setItem("recitation-mode", m);
    } catch {}
  }

  function toggleFollow() {
    setFollow((f) => {
      try {
        localStorage.setItem("recitation-follow", f ? "off" : "on");
      } catch {}
      return !f;
    });
  }

  const capability = hasTiming
    ? "Verse-tracked recitation"
    : hasVerseFiles
      ? "Verse-by-verse audio"
      : "Full-surah audio — plays from the start, without verse tracking";

  return (
    <div className="pb-40 md:pb-32">
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <button onClick={() => setFontSize((s) => Math.max(20, s - 2))} className="h-8 w-8 rounded-full border border-border" aria-label="Smaller Arabic text">
            A-
          </button>
          <button onClick={() => setFontSize((s) => Math.min(44, s + 2))} className="h-8 w-8 rounded-full border border-border" aria-label="Larger Arabic text">
            A+
          </button>
          <select
            value={reciterId}
            onChange={(e) => changeReciter(e.target.value)}
            className="rounded-full border border-border px-3 py-1.5 bg-white text-xs max-w-[180px]"
            aria-label="Reciter"
          >
            <optgroup label="Verse-tracked">
              {RECITERS.filter((r) => r.timingRecitationId || r.mode === "ayah").map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Full surah only">
              {RECITERS.filter((r) => !r.timingRecitationId && r.mode !== "ayah").map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          </select>
          <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
            <input type="checkbox" checked={showTranslation} onChange={(e) => setShowTranslation(e.target.checked)} />
            Translation
          </label>
        </div>
      </div>

      {/* Translation + translation audio */}
      <TranslationChooser value={translation} onChange={changeTranslation}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-teal-dark">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
            </svg>
            Listen to the meaning
          </span>
          <select
            value={translationVoiceId}
            onChange={(e) => setTranslationVoiceId(e.target.value)}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-teal-dark"
            aria-label="Translation audio narrator"
          >
            <option value="">Off</option>
            {TRANSLATION_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.language} — {v.narrator}
              </option>
            ))}
          </select>
          {translationVoiceId && hasVerseFiles && (
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-teal-dark">
              <input type="checkbox" className="accent-primary" checked={readWithTranslation} onChange={(e) => setReadWithTranslation(e.target.checked)} />
              Play after each verse
            </label>
          )}
          {translationVoiceId && !hasVerseFiles && (
            <span className="text-[11px] text-muted">Tap the speaker icon on a verse to hear its translation.</span>
          )}
          {!translationVoiceId && <span className="text-[11px] text-muted">Recorded narration is available in {TRANSLATION_VOICES.length} languages.</span>}
        </div>
      </TranslationChooser>

      <p className="text-[11px] text-muted mt-3">
        Translation: {translation.author} ({translation.language}) · Reciter: {reciter.name} · {capability}
      </p>

      {/* Ayahs */}
      <div className="mt-6 space-y-6">
        {ayahs.map((a, i) => {
          const isCurrent = current === i;
          const reciting = isCurrent && isPlaying;
          return (
            <div
              key={a.globalNumber}
              id={`ayah-${a.numberInSurah}`}
              className={`relative scroll-mt-40 rounded-card border p-5 transition-all duration-300 ${
                reciting
                  ? "border-primary bg-aqua/50 shadow-card ring-4 ring-primary/15"
                  : isCurrent
                    ? "border-primary/60 bg-aqua/25"
                    : "bg-white border-border"
              }`}
            >
              {reciting && <span aria-hidden className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary" />}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-medium ${
                      isCurrent ? "bg-primary text-white" : "bg-aqua text-primary-deep"
                    }`}
                  >
                    {a.numberInSurah}
                  </span>
                  {reciting && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-primary-deep">
                      <span className="flex h-3 items-end gap-0.5" aria-hidden>
                        <span className="w-0.5 animate-pulse rounded bg-primary" style={{ height: "60%" }} />
                        <span className="w-0.5 animate-pulse rounded bg-primary [animation-delay:150ms]" style={{ height: "100%" }} />
                        <span className="w-0.5 animate-pulse rounded bg-primary [animation-delay:300ms]" style={{ height: "40%" }} />
                      </span>
                      Reciting
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <button
                    aria-label={reciting ? "Pause" : `Play ayah ${a.numberInSurah}`}
                    onClick={() => (reciting ? togglePlay() : playFrom(i))}
                    className={`grid h-8 w-8 place-items-center rounded-full ${reciting ? "bg-primary text-white" : "hover:bg-aqua"}`}
                  >
                    {reciting ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  {translationVoiceId && (
                    <button
                      aria-label="Play translation narration"
                      onClick={() =>
                        playingTranslationAyah === a.globalNumber ? translationAudioRef.current?.pause() : playTranslationAyah(a.globalNumber)
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
                  <button aria-label="Copy ayah" onClick={() => copyAyah(a)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-aqua">
                    {copied === a.globalNumber ? <span className="text-[10px] font-semibold text-primary-deep">✓</span> : <CopyIcon />}
                  </button>
                </div>
              </div>
              <p dir="rtl" style={{ fontSize }} className="font-quran text-teal-dark mt-4 text-right">
                {a.arabic}
              </p>
              {showTranslation && (
                <p
                  dir={translationRtl ? "rtl" : undefined}
                  className={`mt-3 text-muted ${translationRtl ? "font-urdu text-right text-lg leading-[2.2]" : "text-[15px] leading-relaxed"}`}
                >
                  {a.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Player bar */}
      <div className="fixed inset-x-0 bottom-16 z-40 px-3 md:bottom-4">
        <div className="mx-auto max-w-[calc(1200px-4rem)] rounded-card border border-border bg-white/95 px-4 py-3 shadow-card backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-teal-dark">{reciter.name}</p>
              <p className="truncate text-[11px] text-muted">
                {loading
                  ? "Loading recitation…"
                  : untracked
                    ? isPlaying
                      ? "Reciting the whole surah (no verse tracking for this reciter)"
                      : "Full-surah audio"
                    : current !== null
                      ? `Ayah ${ayahs[current].numberInSurah} of ${ayahs.length}${isPlaying ? (effectiveMode === "continuous" ? " · continuous" : " · this verse") : ""}`
                      : `${ayahs.length} ayahs · press play`}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => playFrom(Math.max(0, (current ?? 0) - 1))}
                disabled={untracked || current === null || current === 0}
                aria-label="Previous ayah"
                className="grid h-9 w-9 place-items-center rounded-full text-teal-dark hover:bg-aqua disabled:opacity-30"
              >
                <PrevIcon />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-deep"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : isPlaying ? (
                  <PauseIcon size={18} />
                ) : (
                  <PlayIcon size={18} />
                )}
              </button>
              <button
                onClick={() => playFrom(Math.min(ayahs.length - 1, (current ?? -1) + 1))}
                disabled={untracked || (current !== null && current >= ayahs.length - 1)}
                aria-label="Next ayah"
                className="grid h-9 w-9 place-items-center rounded-full text-teal-dark hover:bg-aqua disabled:opacity-30"
              >
                <NextIcon />
              </button>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
              <ModeSwitch mode={effectiveMode} canVerse={canVerse} onChange={changeMode} />
              <FollowToggle on={follow} onClick={toggleFollow} />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 sm:hidden">
            <ModeSwitch mode={effectiveMode} canVerse={canVerse} onChange={changeMode} />
            <FollowToggle on={follow} onClick={toggleFollow} />
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" preload="none" />
      <audio ref={translationAudioRef} className="hidden" preload="none" />
    </div>
  );
}

function ModeSwitch({ mode, canVerse, onChange }: { mode: Mode; canVerse: boolean; onChange: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-bg p-0.5 text-[11px]" role="radiogroup" aria-label="Recitation mode">
      {(
        [
          ["verse", "Verse by verse"],
          ["continuous", "Continuous"]
        ] as const
      ).map(([m, label]) => {
        const disabled = m === "verse" && !canVerse;
        return (
          <button
            key={m}
            role="radio"
            aria-checked={mode === m}
            disabled={disabled}
            title={disabled ? "This reciter only has full-surah audio — choose a verse-tracked reciter" : undefined}
            onClick={() => onChange(m)}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              mode === m ? "bg-teal-dark text-white" : "text-muted hover:text-teal-dark"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function FollowToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title="Keep the recited ayah in view"
      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
        on ? "border-primary bg-aqua text-primary-deep" : "border-border text-muted hover:text-teal-dark"
      }`}
    >
      {on ? "◎ Follow on" : "○ Follow off"}
    </button>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h2v14H6zM20 5v14L9 12z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
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
