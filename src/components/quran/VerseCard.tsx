"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ScrollText, Grid2x2, Sprout, Play, Pause, Loader2, ExternalLink, ListMusic } from "lucide-react";
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

type TabKey = "translations" | "tafaseers" | "w_by_w" | "roots";
type ReadingLang = "both" | "english" | "urdu";

const TABS: { key: TabKey; label: string; icon: typeof Languages }[] = [
  { key: "translations", label: "Translations", icon: Languages },
  { key: "tafaseers", label: "Tafseer", icon: ScrollText },
  { key: "w_by_w", label: "Word by word", icon: Grid2x2 },
  { key: "roots", label: "Root words", icon: Sprout },
];

const LANG_FILTERS = ["All", "Urdu", "English", "Hindi"] as const;

interface PlaybackProps {
  isPlaying: boolean;
  isQueued: boolean;
  isLoading: boolean;
  onPlayOne: () => void;
  onPlayFromHere: () => void;
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
      className="card-surface scroll-mt-24 p-5 sm:p-6"
      style={isPlaying ? { boxShadow: "0 0 0 2px var(--primary), var(--bevel-card), var(--shadow-card)" } : undefined}
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
        {cleanVerseText(verse.verse)}
      </p>

      {/* Base translation */}
      {!isBismillah && (readingLang === "both" || readingLang === "english") && (
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {verse.verseEnglish}
        </p>
      )}
      {!isBismillah && (readingLang === "both" || readingLang === "urdu") && (
        <p dir="rtl" lang="ur" className="font-arabic mt-3 text-[19px] leading-[2]" style={{ color: "var(--muted)" }}>
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
  const filtered = data.filter((t) => langFilter === "All" || languageGroup(t.language) === langFilter);

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
          const isRtl = languageGroup(t.language) === "Urdu";
          return (
            <li key={`${t.translator}-${i}`} className="border-b pb-4 last:border-b-0 last:pb-0" style={{ borderColor: "var(--hair)" }}>
              <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--soft-text)" }}>
                {t.translator} · {t.language}
              </p>
              <p
                dir={isRtl ? "rtl" : "ltr"}
                className={isRtl ? "font-arabic text-[18px] leading-[2]" : "text-[14.5px] leading-relaxed"}
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

function TafseerPanel({ data, idx, setIdx }: { data: Tafseer[] | null; idx: number; setIdx: (i: number) => void }) {
  if (!data || data.length === 0)
    return (
      <p className="text-[14px]" style={{ color: "var(--muted)" }}>
        No tafseer available for this verse.
      </p>
    );
  const safeIdx = Math.min(idx, data.length - 1);
  const current = data[safeIdx];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {data.map((t, i) => {
          const active = i === safeIdx;
          return (
            <button
              key={`${t.name}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
              style={{
                background: active ? "var(--grad-btn)" : "var(--soft)",
                color: active ? "var(--primary-ink)" : "var(--soft-text)",
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
        {current.author}
      </p>
      <p
        dir="rtl"
        lang="ur"
        className="font-arabic mt-2 whitespace-pre-line text-[18px] leading-[2.15]"
        style={{ color: "var(--text)" }}
      >
        {current.text}
      </p>
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
            <span className="font-arabic mt-1 text-[13px]" style={{ color: "var(--soft-text)" }}>
              {w.urdu}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RootsPanel({ data }: { data: RootWord[] | null }) {
  if (!data || data.length === 0)
    return (
      <p className="text-[14px]" style={{ color: "var(--muted)" }}>
        No root words available for this verse.
      </p>
    );

  return (
    <div dir="rtl" className="flex flex-wrap gap-2">
      {data.map((r, i) => (
        <a
          key={i}
          href={r.detailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-3 py-2 transition-transform hover:scale-[1.03]"
          style={{ background: "var(--gold-soft)", border: "1px solid var(--gold)" }}
        >
          <span className="font-arabic text-[19px]" style={{ color: "var(--text)" }}>
            {r.word}
          </span>
          <ExternalLink size={12} style={{ color: "var(--gold)" }} />
        </a>
      ))}
    </div>
  );
}
