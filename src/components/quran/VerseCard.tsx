"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ScrollText, Grid2x2, Sprout, Play, Pause, Loader2, ListMusic, X } from "lucide-react";
import {
  verseFileUrl,
  languageGroup,
  cleanVerseText,
  type VerseBase,
  type Translation,
  type Tafseer,
  type RootWord,
  type WbwEntry,
} from "@/lib/quran";
import type { RootWordDetail } from "@/app/api/root-word-detail/route";

type TabKey = "translations" | "tafaseers" | "w_by_w" | "roots";
type ReadingLang = "both" | "english" | "urdu";

const TABS: { key: TabKey; label: string; icon: typeof Languages }[] = [
  { key: "translations", label: "Translations", icon: Languages },
  { key: "tafaseers", label: "Tafseer", icon: ScrollText },
  { key: "w_by_w", label: "Word by word", icon: Grid2x2 },
  { key: "roots", label: "Root words", icon: Sprout },
];

const LANG_FILTERS = ["All", "Urdu", "English", "Hindi", "Chinese", "German", "Persian", "Pashto"] as const;

interface PlaybackProps {
  isPlaying: boolean;
  isQueued: boolean;
  isLoading: boolean;
  onPlayOne: () => void;
  onPlayFromHere: () => void;
}

// Wraps the first exact match of `word` inside `text` in a highlight <mark>.
// Best-effort: the word form comes from a third-party source (al-hadees.com)
// which may diacritize it slightly differently than our own verse text, so
// a miss just falls back to plain, unhighlighted text.
function renderWithHighlight(text: string, word: string | null): React.ReactNode {
  if (!word) return text;
  const idx = text.indexOf(word);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded px-0.5" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
        {word}
      </mark>
      {text.slice(idx + word.length)}
    </>
  );
}

export default function VerseCard({
  surah,
  verse,
  readingLang,
  playback,
}: {
  surah: number;
  verse: VerseBase;
  readingLang: ReadingLang;
  playback: PlaybackProps;
}) {
  const [active, setActive] = useState<TabKey | null>(null);

  // Lazy caches per detail type.
  const [translations, setTranslations] = useState<Translation[] | null>(null);
  const [tafaseers, setTafaseers] = useState<Tafseer[] | null>(null);
  const [wbw, setWbw] = useState<WbwEntry[] | null>(null);
  const [roots, setRoots] = useState<RootWord[] | null>(null);
  const [loading, setLoading] = useState<TabKey | null>(null);
  const [error, setError] = useState<TabKey | null>(null);

  // Sub-selections inside panels.
  const [langFilter, setLangFilter] = useState<(typeof LANG_FILTERS)[number]>("All");
  const [tafseerIdx, setTafseerIdx] = useState(0);
  const [wbwIdx, setWbwIdx] = useState(0);

  const isBismillah = verse.verseNumber === 0;

  // Highlights this verse — and the specific word within it, when known —
  // when it's the target of a #verse-N link (e.g. an occurrence clicked from
  // a root word's detail panel). Stays highlighted for as long as the URL
  // still points here (no auto-fade); re-checks on "hashchange" too, since
  // navigating to the same surah's own anchor doesn't remount this component.
  const [isTargeted, setIsTargeted] = useState(false);
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  useEffect(() => {
    const anchor = `#verse-${verse.verseNumber}`;

    function checkHash() {
      const matches = window.location.hash === anchor;
      setIsTargeted(matches);
      setHighlightWord(matches ? new URLSearchParams(window.location.search).get("hlword") : null);
    }

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [verse.verseNumber]);

  async function loadTab(key: TabKey) {
    // Toggle closed if already open.
    if (active === key) {
      setActive(null);
      return;
    }
    setActive(key);
    setError(null);

    const already =
      (key === "translations" && translations) ||
      (key === "tafaseers" && tafaseers) ||
      (key === "w_by_w" && wbw) ||
      (key === "roots" && roots);
    if (already) return;

    const file =
      key === "translations"
        ? "translations"
        : key === "tafaseers"
        ? "tafaseers"
        : key === "w_by_w"
        ? "w_by_w_translation"
        : "root_words";

    try {
      setLoading(key);
      const res = await fetch(verseFileUrl(surah, verse.verseNumber, file));
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (key === "translations") setTranslations(data);
      else if (key === "tafaseers") setTafaseers(data);
      else if (key === "w_by_w") setWbw(data);
      else setRoots(data);
    } catch {
      setError(key);
    } finally {
      setLoading(null);
    }
  }

  const { isPlaying, isQueued, isLoading: audioLoading, onPlayOne, onPlayFromHere } = playback;

  return (
    <article
      id={`verse-${verse.verseNumber}`}
      className="card-surface scroll-mt-24 p-5 transition-colors duration-700 sm:p-6"
      style={
        isPlaying
          ? { boxShadow: "0 0 0 2px var(--primary), var(--bevel-card), var(--shadow-card)" }
          : isTargeted
            ? { boxShadow: "0 0 0 2px var(--gold), var(--bevel-card), var(--shadow-card)", background: "var(--gold-soft)" }
            : undefined
      }
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full" aria-hidden>
            <path
              d="M24 2 L30 8 L38 6 L38 14 L46 18 L40 24 L46 30 L38 34 L38 42 L30 40 L24 46 L18 40 L10 42 L10 34 L2 30 L8 24 L2 18 L10 14 L10 6 L18 8 Z"
              fill="var(--soft)"
              stroke="var(--primary)"
              strokeWidth="1"
            />
          </svg>
          <span className="relative text-[12px] font-bold" style={{ color: "var(--primary)" }}>
            {isBismillah ? "﷽" : verse.verseNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPlayFromHere}
            aria-label={isQueued ? "Stop continuous playback" : "Play from this ayah to the end of the surah"}
            title="Play from here"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{
              background: isQueued ? "var(--primary)" : "var(--soft)",
              color: isQueued ? "var(--primary-ink)" : "var(--primary)",
            }}
          >
            <ListMusic size={15} />
          </button>
          <button
            type="button"
            onClick={onPlayOne}
            aria-label={isPlaying ? "Pause recitation" : "Play this ayah"}
            title="Play this ayah"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{
              background: isPlaying ? "var(--primary)" : "var(--soft)",
              color: isPlaying ? "var(--primary-ink)" : "var(--primary)",
            }}
          >
            {isPlaying && audioLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Arabic */}
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic mt-5 text-[26px] leading-[2.1] sm:text-[30px]"
        style={{ color: "var(--text)" }}
      >
        {renderWithHighlight(cleanVerseText(verse.verse), isTargeted ? highlightWord : null)}
      </p>

      {/* Base translation */}
      {!isBismillah && (readingLang === "both" || readingLang === "english") && (
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {verse.verseEnglish}
        </p>
      )}
      {!isBismillah && (readingLang === "both" || readingLang === "urdu") && (
        <p dir="rtl" lang="ur" className="font-urdu mt-3 text-[19px] leading-[2]" style={{ color: "var(--muted)" }}>
          {verse.verseUrdu}
        </p>
      )}

      {/* Tab bar */}
      <div className="mt-5 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--hair)" }}>
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => loadTab(t.key)}
              className="inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
              style={{
                background: isActive ? "var(--soft)" : "transparent",
                color: isActive ? "var(--soft-text)" : "var(--muted)",
                border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-[var(--r-card)] p-4" style={{ background: "var(--card-2)", border: "1px solid var(--hair)" }}>
              {loading === active ? (
                <div className="flex items-center gap-2 py-6 text-[14px]" style={{ color: "var(--muted)" }}>
                  <Loader2 size={16} className="animate-spin" /> Loading…
                </div>
              ) : error === active ? (
                <div className="py-6 text-[14px]" style={{ color: "var(--muted)" }}>
                  Couldn&rsquo;t load this section.{" "}
                  <button type="button" onClick={() => loadTab(active)} className="underline" style={{ color: "var(--primary)" }}>
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {active === "translations" && (
                    <TranslationsPanel data={translations} langFilter={langFilter} setLangFilter={setLangFilter} />
                  )}
                  {active === "tafaseers" && (
                    <TafseerPanel data={tafaseers} idx={tafseerIdx} setIdx={setTafseerIdx} />
                  )}
                  {active === "w_by_w" && <WbwPanel data={wbw} idx={wbwIdx} setIdx={setWbwIdx} />}
                  {active === "roots" && <RootsPanel data={roots} />}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

/* ---------------- Panels ---------------- */

// Raw translator names from the data source, mapped to their proper full
// display form. Also determines priority ordering — Ala Hazrat's Kanzul
// Eman is shown first among Urdu translations.
const TRANSLATOR_DISPLAY_NAMES: Record<string, string> = {
  "Ahmad Raza Khan | Kanzul Eman": "Ala Hazrat Imam Ahmad Raza Khan | Kanzul Eman",
};
const PRIORITY_TRANSLATORS = new Set(Object.keys(TRANSLATOR_DISPLAY_NAMES));

function TranslationsPanel({
  data,
  langFilter,
  setLangFilter,
}: {
  data: Translation[] | null;
  langFilter: (typeof LANG_FILTERS)[number];
  setLangFilter: (v: (typeof LANG_FILTERS)[number]) => void;
}) {
  if (!data) return null;
  const filtered = data
    .filter((t) => langFilter === "All" || languageGroup(t.language) === langFilter)
    .slice()
    .sort((a, b) => Number(PRIORITY_TRANSLATORS.has(b.translator)) - Number(PRIORITY_TRANSLATORS.has(a.translator)));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {LANG_FILTERS.map((l) => {
          const active = langFilter === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLangFilter(l)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
              style={{
                background: active ? "var(--grad-btn)" : "var(--soft)",
                color: active ? "var(--primary-ink)" : "var(--soft-text)",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-4">
        {filtered.map((t, i) => {
          const group = languageGroup(t.language);
          const isRtl = group === "Urdu" || group === "Persian" || group === "Pashto";
          return (
            <li key={`${t.translator}-${i}`} className="border-b pb-4 last:border-b-0 last:pb-0" style={{ borderColor: "var(--hair)" }}>
              <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--soft-text)" }}>
                {TRANSLATOR_DISPLAY_NAMES[t.translator] ?? t.translator} · {t.language}
              </p>
              <p
                dir={isRtl ? "rtl" : "ltr"}
                className={isRtl ? "font-urdu text-[18px] leading-[2]" : "text-[14.5px] leading-relaxed"}
                style={{ color: "var(--text)" }}
              >
                {t.text}
              </p>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-[14px]" style={{ color: "var(--muted)" }}>
            No {langFilter} translation available for this verse.
          </li>
        )}
      </ul>
    </div>
  );
}

// Not real tafseer data — always shown alongside whatever's available, so
// readers know it's on the way rather than assuming it's just missing.
const COMING_SOON_TAFSEER: Tafseer = { name: "Sirat-ul-Jinan", author: "Mufti Qasim Attari Qadri", text: "", language: "Urdu" };

const TAFSEER_LANG_FILTERS = ["All", "Arabic", "Urdu"] as const;

function TafseerPanel({ data, idx, setIdx }: { data: Tafseer[] | null; idx: number; setIdx: (i: number) => void }) {
  const [langFilter, setLangFilter] = useState<(typeof TAFSEER_LANG_FILTERS)[number]>("All");

  // The "coming soon" placeholder is treated as one more entry in the same
  // list (last position) so filtering and selection logic only has to deal
  // with one array.
  const fullList = [...(data ?? []), COMING_SOON_TAFSEER];
  const comingSoonIndex = fullList.length - 1;

  const visibleIndexes = fullList.map((_, i) => i).filter((i) => langFilter === "All" || fullList[i].language === langFilter);

  // Keep the active tab within whatever the filter currently shows —
  // switching to "Urdu" while an Arabic tafseer is open shouldn't leave a
  // stale, now-hidden tab looking selected.
  useEffect(() => {
    if (!visibleIndexes.includes(idx)) {
      setIdx(visibleIndexes[0] ?? comingSoonIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langFilter]);

  const safeIdx = visibleIndexes.includes(idx) ? idx : (visibleIndexes[0] ?? comingSoonIndex);
  const isComingSoon = safeIdx === comingSoonIndex;
  const current = fullList[safeIdx];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TAFSEER_LANG_FILTERS.map((l) => {
          const active = langFilter === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLangFilter(l)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
              style={{
                background: active ? "var(--grad-btn)" : "var(--soft)",
                color: active ? "var(--primary-ink)" : "var(--soft-text)",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visibleIndexes.map((i) => {
          const active = i === safeIdx;
          return (
            <button
              key={`${fullList[i].name}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
              style={{
                background: active ? "var(--grad-btn)" : "var(--soft)",
                color: active ? "var(--primary-ink)" : "var(--soft-text)",
              }}
            >
              {fullList[i].name}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
        {current.author}
      </p>
      {isComingSoon ? (
        <p className="mt-2 text-[14px]" style={{ color: "var(--muted)" }}>
          Coming soon.
        </p>
      ) : current.language === "Arabic" ? (
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic-text mt-2 whitespace-pre-line text-justify text-[19px] leading-[2.2]"
          style={{ color: "var(--text)" }}
        >
          {current.text}
        </p>
      ) : (
        <p
          dir="rtl"
          lang="ur"
          className="font-urdu mt-2 whitespace-pre-line text-[18px] leading-[2.15]"
          style={{ color: "var(--text)" }}
        >
          {current.text}
        </p>
      )}
    </div>
  );
}

function WbwPanel({ data, idx, setIdx }: { data: WbwEntry[] | null; idx: number; setIdx: (i: number) => void }) {
  if (!data || data.length === 0)
    return (
      <p className="text-[14px]" style={{ color: "var(--muted)" }}>
        No word-by-word breakdown available for this verse.
      </p>
    );
  const safeIdx = Math.min(idx, data.length - 1);
  const current = data[safeIdx];

  return (
    <div>
      {data.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {data.map((e, i) => {
            const active = i === safeIdx;
            return (
              <button
                key={`${e.translator}-${i}`}
                type="button"
                onClick={() => setIdx(i)}
                className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? "var(--grad-btn)" : "var(--soft)",
                  color: active ? "var(--primary-ink)" : "var(--soft-text)",
                }}
              >
                {e.translator}
              </button>
            );
          })}
        </div>
      )}

      <div dir="rtl" className="flex flex-wrap gap-2.5">
        {current.words.map((w, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-[var(--r-chip)] px-3 py-2 text-center"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <span className="font-arabic text-[20px] leading-tight" style={{ color: "var(--text)" }}>
              {w.arabic}
            </span>
            <span className="font-urdu mt-1 text-[13px]" style={{ color: "var(--soft-text)" }}>
              {w.urdu}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RootsPanel({ data }: { data: RootWord[] | null }) {
  const [selected, setSelected] = useState<RootWord | null>(null);
  const [detail, setDetail] = useState<RootWordDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setDetail(null);
    setError(false);
    setLoading(true);
    fetch(`/api/root-word-detail?url=${encodeURIComponent(selected.detailUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<RootWordDetail>;
      })
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // Lock page scroll while the detail modal is open.
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  if (!data || data.length === 0)
    return (
      <p className="text-[14px]" style={{ color: "var(--muted)" }}>
        No root words available for this verse.
      </p>
    );

  return (
    <>
      <div dir="rtl" className="flex flex-wrap gap-2">
        {data.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(r)}
            className="inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-3 py-2 transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gold-soft)", border: "1px solid var(--gold)" }}
          >
            <span className="font-arabic-text text-[19px]" style={{ color: "var(--text)" }}>
              {r.word}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--r-card)]"
              style={{ background: "var(--card)", boxShadow: "var(--shadow-lg)" }}
            >
              <div className="flex items-center justify-between gap-3 border-b p-4" style={{ borderColor: "var(--hair)" }}>
                <div className="flex items-baseline gap-2">
                  <span dir="rtl" className="font-arabic-text text-[22px]" style={{ color: "var(--text)" }}>
                    {detail?.word ?? selected.word}
                  </span>
                  {detail?.wordsFoundLabel && (
                    <span className="text-[12px]" style={{ color: "var(--faint)" }}>
                      {detail.wordsFoundLabel}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {loading && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={22} className="animate-spin" style={{ color: "var(--primary)" }} />
                  </div>
                )}
                {!loading && error && (
                  <p className="text-[14px]" style={{ color: "var(--muted)" }}>
                    Couldn&rsquo;t load the detail for this word.
                  </p>
                )}
                {!loading && !error && detail && (
                  <div className="space-y-5">
                    {detail.meaning && (
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
                          Meaning
                        </p>
                        <p dir="rtl" className="font-urdu text-justify text-[19px] leading-[2]" style={{ color: "var(--text)" }}>
                          {detail.meaning}
                        </p>
                      </div>
                    )}
                    {detail.occurrences.length > 0 && (
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
                          Occurrences
                        </p>
                        <div dir="rtl" className="flex flex-wrap gap-2">
                          {detail.occurrences.map((occ, i) =>
                            occ.surahNumber && occ.verseNumber ? (
                              <Link
                                key={i}
                                href={`/quran/${occ.surahNumber}?hlword=${encodeURIComponent(occ.word)}#verse-${occ.verseNumber}`}
                                onClick={() => setSelected(null)}
                                className="flex items-center gap-2 rounded-[var(--r-chip)] px-3 py-2 transition-transform hover:scale-[1.03]"
                                style={{ background: "var(--soft)" }}
                              >
                                <span className="font-arabic-text text-[16px]" style={{ color: "var(--text)" }}>
                                  {occ.word}
                                </span>
                                <span className="text-[12px]" style={{ color: "var(--soft-text)" }}>
                                  {occ.surahName} · {occ.verseNumber}
                                </span>
                              </Link>
                            ) : (
                              <span
                                key={i}
                                className="flex items-center gap-2 rounded-[var(--r-chip)] px-3 py-2"
                                style={{ background: "var(--soft)" }}
                              >
                                <span className="font-arabic-text text-[16px]" style={{ color: "var(--text)" }}>
                                  {occ.word}
                                </span>
                                <span className="text-[12px]" style={{ color: "var(--soft-text)" }}>
                                  {occ.surahName}
                                </span>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {!detail.meaning && detail.occurrences.length === 0 && (
                      <p className="text-[14px]" style={{ color: "var(--muted)" }}>
                        No detail available for this word.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
