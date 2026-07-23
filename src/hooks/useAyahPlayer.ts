"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ayahAudioUrl, type Reciter } from "@/lib/reciters";
import type { VerseBase } from "@/lib/quran";

interface UseAyahPlayerOptions {
  surahNumber: number;
  verses: VerseBase[];
  reciter: Reciter;
  translationVoice: Reciter | null;
  autoContinue: boolean;
  nextSurahNumber: number | null;
  nextSurahPathTemplate?: (surah: number) => string;
}

export interface AyahPlayerState {
  playingIndex: number | null;
  isQueue: boolean;
  isLoading: boolean;
}

// Single shared <audio> element per reading page, driven by a small queue
// engine: playOne() plays exactly one ayah, playFrom() auto-advances through
// the rest of the surah (optionally interleaving a translation-audio clip),
// and — when the surah finishes — can hand off to the next surah's page via
// a `?autoplay=1` navigation so "complete Quran" playback can continue
// across routes. Settings (reciter/voice/auto-continue) are read from refs
// so switching them mid-queue takes effect starting the very next ayah.
export function useAyahPlayer({
  surahNumber,
  verses,
  reciter,
  translationVoice,
  autoContinue,
  nextSurahNumber,
  nextSurahPathTemplate,
}: UseAyahPlayerOptions) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AyahPlayerState>({ playingIndex: null, isQueue: false, isLoading: false });

  const settingsRef = useRef({ surahNumber, verses, reciter, translationVoice, autoContinue, nextSurahNumber, nextSurahPathTemplate });
  settingsRef.current = { surahNumber, verses, reciter, translationVoice, autoContinue, nextSurahNumber, nextSurahPathTemplate };

  const playIndexRef = useRef<(index: number, queue: boolean) => void>(() => {});

  useEffect(() => {
    const el = new Audio();
    el.preload = "none";
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
    };
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.onended = null;
      el.onerror = null;
      el.onplaying = null;
      el.pause();
    }
    setState({ playingIndex: null, isQueue: false, isLoading: false });
  }, []);

  playIndexRef.current = (index: number, queue: boolean) => {
    const el = audioRef.current;
    const { surahNumber, verses, reciter, translationVoice, autoContinue, nextSurahNumber, nextSurahPathTemplate } =
      settingsRef.current;
    const verse = verses[index];
    if (!el || !verse) {
      stop();
      return;
    }

    let phase: "recitation" | "translation" = "recitation";
    setState({ playingIndex: index, isQueue: queue, isLoading: true });

    const goNext = () => {
      const nextIdx = index + 1;
      if (nextIdx < verses.length) {
        playIndexRef.current(nextIdx, true);
      } else if (autoContinue && nextSurahNumber) {
        const path = nextSurahPathTemplate ? nextSurahPathTemplate(nextSurahNumber) : `/quran/${nextSurahNumber}`;
        stop();
        router.push(`${path}${path.includes("?") ? "&" : "?"}autoplay=1`);
      } else {
        stop();
      }
    };

    const advance = () => {
      if (!queue) return;
      if (phase === "recitation" && translationVoice) {
        phase = "translation";
        el.src = ayahAudioUrl(translationVoice, surahNumber, verse.verseNumber);
        el.play().catch(goNext);
        return;
      }
      goNext();
    };

    el.onended = advance;
    el.onerror = () => {
      // Missing clip (e.g. no standalone Bismillah for this reciter) — skip
      // ahead instead of stalling playback.
      if (phase === "translation") goNext();
      else if (queue) goNext();
      else stop();
    };
    el.onplaying = () => setState((s) => ({ ...s, isLoading: false }));

    el.src = ayahAudioUrl(reciter, surahNumber, verse.verseNumber);
    el.play().catch(() => {
      if (queue) goNext();
      else stop();
    });
  };

  const playOne = useCallback(
    (index: number) => {
      if (state.playingIndex === index && !state.isQueue) {
        stop();
        return;
      }
      playIndexRef.current(index, false);
    },
    [state.playingIndex, state.isQueue, stop]
  );

  const playFrom = useCallback(
    (index: number) => {
      if (state.playingIndex === index && state.isQueue) {
        stop();
        return;
      }
      playIndexRef.current(index, true);
    },
    [state.playingIndex, state.isQueue, stop]
  );

  return { ...state, playOne, playFrom, stop };
}
