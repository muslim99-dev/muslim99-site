"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Copy, Check, ChevronDown } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import GradeBadge from "./GradeBadge";
import { splitNarrator, formatHadithForShare, type Hadith, type TextDirection } from "@/lib/hadith";

export default function HadithCard({
  hadith,
  bookSlug,
  bookName,
  chapterName,
  chapterNumber,
  direction,
  languageName,
  language,
}: {
  hadith: Hadith;
  bookSlug: string;
  bookName: string;
  chapterName: string | null;
  chapterNumber: number | null;
  direction: TextDirection;
  languageName: string;
  language: string;
}) {
  const { isBookmarked, toggleBookmark } = useHadithPreferences();
  const [copied, setCopied] = useState(false);
  const [showGrades, setShowGrades] = useState(false);
  const bookmarked = isBookmarked(bookSlug, hadith.hadithNumber);
  const { narrator, body } = splitNarrator(hadith.text);

  async function handleCopy() {
    const text = formatHadithForShare({
      bookName,
      chapterName: chapterName ?? undefined,
      hadithNumber: hadith.hadithNumber,
      translatedText: hadith.text,
      languageName,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently ignore, copy button remains usable to retry
    }
  }

  function handleBookmark() {
    toggleBookmark({
      bookSlug,
      bookName,
      chapterNumber,
      hadithNumber: hadith.hadithNumber,
      excerpt: body.slice(0, 140),
      savedAt: Date.now(),
    });
  }

  return (
    <article id={`hadith-${hadith.hadithNumber}`} className="card-surface scroll-mt-24 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold"
            style={{ background: "var(--soft)", color: "var(--primary)" }}
          >
            {hadith.hadithNumber}
          </span>
          {hadith.grades[0] && <GradeBadge grade={hadith.grades[0].grade} />}
          {hadith.grades.length > 1 && (
            <button
              type="button"
              onClick={() => setShowGrades((v) => !v)}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium transition-colors"
              style={{ color: "var(--faint)" }}
            >
              +{hadith.grades.length - 1} more
              <ChevronDown size={12} className={`transition-transform ${showGrades ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy hadith"
            title="Copy Arabic + translation + reference"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            style={{ background: "var(--soft)", color: "var(--primary)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                  <Check size={15} />
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                  <Copy size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this hadith"}
            aria-pressed={bookmarked}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            style={{ background: bookmarked ? "var(--primary)" : "var(--soft)", color: bookmarked ? "var(--primary-ink)" : "var(--primary)" }}
          >
            <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {narrator && (
        <p className="mt-4 text-[13px] font-semibold" style={{ color: "var(--soft-text)" }}>
          {narrator}
        </p>
      )}
      <p
        dir={direction}
        lang={direction === "rtl" ? undefined : "en"}
        className={`mt-2 leading-relaxed ${direction === "rtl" ? `${language === "urd" ? "font-urdu" : "font-arabic-text"} text-[19px] leading-[2]` : "text-[15px]"}`}
        style={{ color: "var(--text)" }}
      >
        {body}
      </p>

      <AnimatePresence initial={false}>
        {showGrades && hadith.grades.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "var(--hair)" }}>
              {hadith.grades.map((g, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]" style={{ background: "var(--card-2)", color: "var(--muted)" }}>
                  <strong style={{ color: "var(--text)" }}>{g.name}:</strong> {g.grade}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 border-t pt-3 text-[11.5px]" style={{ borderColor: "var(--hair)", color: "var(--faint)" }}>
        {bookName}
        {chapterName ? `, ${chapterName}` : ""} · Hadith {hadith.hadithNumber}
        {hadith.arabicNumber !== hadith.hadithNumber ? ` (Arabic: ${hadith.arabicNumber})` : ""}
      </p>
    </article>
  );
}
