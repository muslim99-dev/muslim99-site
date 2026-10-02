"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Chapter, Hadith } from "@/lib/hadith";
import { GradeBadge } from "@/components/hadith/HadithUI";
import { useSavedHadith } from "@/components/hadith/useSavedHadith";
import { saveReadingPosition } from "@/lib/hadithHistory";
import type { HadithLocation, SavedKind } from "@/lib/hadithRefs";

type Lang = "arabic" | "english" | "urdu";
const ARABIC_SIZES = ["text-xl", "text-2xl", "text-[1.7rem]", "text-[2rem]"];
const PREFS_KEY = "hadith-reader-prefs";

function referenceLabel(h: Hadith) {
  const intl = h.reference?.international_number;
  return intl && intl !== String(h.hadith_number) ? `Ref. ${intl}` : null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-deep">
      <span className="h-px w-4 bg-primary/40" />
      {children}
    </p>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
  );
}

function SaveButton({
  active,
  onClick,
  kind
}: {
  active: boolean;
  onClick: () => void;
  kind: SavedKind;
}) {
  const label = kind === "bookmark" ? (active ? "Remove bookmark" : "Bookmark") : active ? "Remove from favourites" : "Add to favourites";
  const activeStyle = kind === "bookmark" ? "border-primary bg-aqua text-primary-deep" : "border-rose-200 bg-rose-50 text-rose-600";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-full border transition-colors ${
        active ? activeStyle : "border-border text-muted hover:border-primary hover:text-primary-deep"
      }`}
    >
      {kind === "bookmark" ? <BookmarkIcon filled={active} /> : <HeartIcon filled={active} />}
    </button>
  );
}

function HadithCard({
  h,
  loc,
  collectionName,
  show,
  arabicSize,
  highlighted,
  isSaved,
  onToggle
}: {
  h: Hadith;
  loc: HadithLocation;
  collectionName: string;
  show: Record<Lang, boolean>;
  arabicSize: string;
  highlighted: boolean;
  isSaved: (loc: HadithLocation, kind: SavedKind) => boolean;
  onToggle: (loc: HadithLocation, kind: SavedKind) => void;
}) {
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const ref = referenceLabel(h);

  async function copy(kind: "text" | "link") {
    const url = `${window.location.origin}${window.location.pathname}?hadith=${h.hadith_number}`;
    const text =
      kind === "link"
        ? url
        : [h.arabic_text, h.english_translation, h.urdu_translation, `— ${collectionName} #${h.hadith_number}${h.status ? ` (${h.status})` : ""}`]
            .filter(Boolean)
            .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable (insecure context) — nothing useful to do */
    }
  }

  return (
    <article
      id={`hadith-${h.hadith_number}`}
      data-hadith={h.hadith_number}
      className={`scroll-mt-28 overflow-hidden rounded-card border bg-white transition-shadow ${
        highlighted ? "border-primary ring-4 ring-primary/15 shadow-card" : "border-border hover:shadow-card"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/60 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 min-w-9 place-items-center rounded-lg bg-teal-dark px-2 text-sm font-semibold tabular-nums text-white">
            {h.hadith_number}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-teal-dark">
              {collectionName} #{h.hadith_number}
            </p>
            {ref && <p className="text-[11px] text-muted">{ref}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GradeBadge status={h.status} />
          <SaveButton kind="bookmark" active={isSaved(loc, "bookmark")} onClick={() => onToggle(loc, "bookmark")} />
          <SaveButton kind="favourite" active={isSaved(loc, "favourite")} onClick={() => onToggle(loc, "favourite")} />
          <button
            onClick={() => copy("text")}
            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary-deep"
          >
            {copied === "text" ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={() => copy("link")}
            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary-deep"
          >
            {copied === "link" ? "Link copied ✓" : "Share"}
          </button>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8">
        {show.arabic && h.arabic_text && (
          <p dir="rtl" lang="ar" className={`text-right font-quran ${arabicSize} text-teal-dark`}>
            {h.arabic_text}
          </p>
        )}

        {show.english && h.english_translation && (
          <div>
            <SectionLabel>English</SectionLabel>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-teal-dark/90">{h.english_translation}</p>
          </div>
        )}

        {show.urdu && h.urdu_translation && (
          <div>
            <SectionLabel>اردو ترجمہ · Urdu</SectionLabel>
            <p dir="rtl" lang="ur" className="whitespace-pre-line text-right font-urdu text-[17px] leading-[2.4] text-teal-dark/90">
              {h.urdu_translation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default function HadithChapterView({ chapter, collectionName }: { chapter: Chapter; collectionName: string }) {
  const available: Record<Lang, boolean> = {
    arabic: chapter.hadiths.some((h) => h.arabic_text),
    english: chapter.hadiths.some((h) => h.english_translation),
    urdu: chapter.hadiths.some((h) => h.urdu_translation)
  };
  const [show, setShow] = useState<Record<Lang, boolean>>({ arabic: true, english: true, urdu: true });
  const [sizeIndex, setSizeIndex] = useState(1);
  const searchParams = useSearchParams();
  const targetHadith = searchParams.get("hadith");
  const { isSaved, toggle: toggleSaved } = useSavedHadith();
  const listRef = useRef<HTMLDivElement>(null);
  const chapterTitle = chapter.english || chapter.urdu || chapter.arabic || `Chapter ${chapter.number}`;

  // Continue reading: remember the hadith currently in the upper part of
  // the screen. Opening a chapter counts as reading its first hadith.
  useEffect(() => {
    const first = chapter.hadiths[0];
    if (!first) return;
    const record = (hadith: number) =>
      saveReadingPosition({ slug: chapter.collection, collectionName, book: chapter.book, chapter: chapter.number, hadith, chapterTitle });
    if (!targetHadith) record(first.hadith_number);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) record(Number((visible[0].target as HTMLElement).dataset.hadith));
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    listRef.current?.querySelectorAll("[data-hadith]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter, collectionName, chapterTitle, targetHadith]);

  // Reader preferences are a per-visitor convenience — fine if storage is unavailable.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
      if (saved?.show) setShow((s) => ({ ...s, ...saved.show }));
      if (typeof saved?.sizeIndex === "number") setSizeIndex(Math.min(Math.max(saved.sizeIndex, 0), ARABIC_SIZES.length - 1));
    } catch {}
  }, []);

  function savePrefs(next: { show?: Record<Lang, boolean>; sizeIndex?: number }) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ show, sizeIndex, ...next }));
    } catch {}
  }

  function toggle(lang: Lang) {
    const next = { ...show, [lang]: !show[lang] };
    setShow(next);
    savePrefs({ show: next });
  }

  function resize(delta: number) {
    const next = Math.min(Math.max(sizeIndex + delta, 0), ARABIC_SIZES.length - 1);
    setSizeIndex(next);
    savePrefs({ sizeIndex: next });
  }

  // Deep-linked from search results or a shared link (?hadith=N).
  useEffect(() => {
    if (!targetHadith) return;
    document.getElementById(`hadith-${targetHadith}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetHadith]);

  const langs = (["arabic", "english", "urdu"] as Lang[]).filter((l) => available[l]);
  const labels: Record<Lang, string> = { arabic: "Arabic", english: "English", urdu: "Urdu" };

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-1 rounded-full border border-border bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" role="group" aria-label="Languages">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => toggle(l)}
                aria-pressed={show[l]}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  show[l] ? "bg-teal-dark text-white" : "text-muted hover:bg-aqua"
                }`}
              >
                {labels[l]}
              </button>
            ))}
          </div>
          {available.arabic && show.arabic && (
            <div className="flex items-center gap-1" role="group" aria-label="Arabic text size">
              <button
                onClick={() => resize(-1)}
                disabled={sizeIndex === 0}
                className="grid h-7 w-7 place-items-center rounded-full text-xs text-muted hover:bg-aqua disabled:opacity-40"
                aria-label="Smaller Arabic text"
              >
                A−
              </button>
              <button
                onClick={() => resize(1)}
                disabled={sizeIndex === ARABIC_SIZES.length - 1}
                className="grid h-7 w-7 place-items-center rounded-full text-sm text-muted hover:bg-aqua disabled:opacity-40"
                aria-label="Larger Arabic text"
              >
                A+
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={listRef} className="mt-6 space-y-5">
        {chapter.hadiths.map((h, i) => (
          <HadithCard
            key={`${h.hadith_number}-${i}`}
            h={h}
            loc={{ slug: chapter.collection, book: chapter.book, chapter: chapter.number, hadith: h.hadith_number }}
            isSaved={isSaved}
            onToggle={toggleSaved}
            collectionName={collectionName}
            show={show}
            arabicSize={ARABIC_SIZES[sizeIndex]}
            highlighted={targetHadith === String(h.hadith_number)}
          />
        ))}
      </div>
    </div>
  );
}
