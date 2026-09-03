"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import { EmptyState, BookX } from "./StateViews";
import { useHadithEdition } from "@/lib/useHadithEdition";
import type { BookEdition, HadithLanguage, LanguageCode } from "@/lib/hadith";

const PAGE_SIZE = 13;

export default function ChapterList({
  bookSlug,
  bookNumber,
  initialEdition,
  initialLanguage,
  availableLanguages,
}: {
  bookSlug: string;
  bookNumber: number;
  initialEdition: BookEdition;
  initialLanguage: LanguageCode;
  availableLanguages: HadithLanguage[];
}) {
  const { edition, direction } = useHadithEdition(bookSlug, initialEdition, initialLanguage, availableLanguages);
  const bookInfo = edition.books.find((b) => b.number === bookNumber);
  const chapters = edition.chapters.filter((c) => c.bookNumber === bookNumber);

  const { lastReadChapter } = useHadithPreferences();
  const resumeChapter = lastReadChapter(bookSlug);
  const [page, setPage] = useState(1);
  const [prevBookSlug, setPrevBookSlug] = useState(bookSlug);
  if (bookSlug !== prevBookSlug) {
    setPrevBookSlug(bookSlug);
    setPage(1);
  }

  if (!bookInfo || chapters.length === 0) {
    return <EmptyState icon={BookX} title="No chapters available" description="This book doesn't have chapter data yet." />;
  }

  const totalPages = Math.max(1, Math.ceil(chapters.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageChapters = chapters.slice(start, start + PAGE_SIZE);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  return (
    <div>
      <div className="-mx-5 mb-6 px-5 py-8 text-center sm:-mx-6 sm:px-6" style={{ background: "var(--card-2)" }}>
        {bookInfo.nativeName && (
          <p
            dir="rtl"
            className={`text-[24px] leading-relaxed ${bookInfo.nativeNameLang === "urd" ? "font-urdu" : "font-arabic-text"}`}
            style={{ color: "var(--text)" }}
          >
            {bookInfo.nativeName}
          </p>
        )}
        <h1 dir={direction} className="mt-2 text-[20px] font-semibold" style={{ color: "var(--text)" }}>
          {bookInfo.name}
        </h1>
        <p className="mt-3 text-[13.5px]" style={{ color: "var(--muted)" }}>
          {bookInfo.totalChapters} subject{bookInfo.totalChapters === 1 ? "" : "s"} found
        </p>
      </div>

      <div dir={direction} className="space-y-2.5">
        {pageChapters.map((chapter, i) => (
          <motion.div
            key={chapter.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 14) * 0.02 }}
          >
            <Link
              href={`/hadith/${bookSlug}/${bookNumber}/${chapter.number}`}
              className="card-surface flex items-center gap-4 p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="w-6 shrink-0 text-center text-[14px] font-semibold" style={{ color: "var(--faint)" }}>
                {chapter.number}
              </span>
              <div className="min-w-0 flex-1">
                <p dir="ltr" className="text-[15px] font-semibold leading-snug" style={{ color: "var(--primary)" }}>
                  {direction === "ltr" ? chapter.name : chapter.secondaryName ?? chapter.name}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[12.5px]" style={{ color: "var(--muted)" }}>
                  {chapter.totalHadiths} hadith{chapter.totalHadiths === 1 ? "" : "s"}
                  {resumeChapter?.bookNumber === bookNumber && resumeChapter?.chapterNumber === chapter.number && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                      style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                    >
                      <History size={10} /> Last read
                    </span>
                  )}
                </p>
              </div>
              {(direction === "rtl" ? chapter.name : chapter.secondaryName) && (
                <p
                  dir="rtl"
                  className="font-urdu hidden w-2/5 shrink-0 text-right text-[15px] leading-snug sm:block"
                  style={{ color: "var(--soft-text)" }}
                >
                  {direction === "rtl" ? chapter.name : chapter.secondaryName}
                </p>
              )}
              <ChevronRight size={16} className="shrink-0" style={{ color: "var(--faint)" }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-40"
            style={{ background: "var(--soft)", color: "var(--primary)" }}
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Page {currentPage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-40"
            style={{ background: "var(--soft)", color: "var(--primary)" }}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
