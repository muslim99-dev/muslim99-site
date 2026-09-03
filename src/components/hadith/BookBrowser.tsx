"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, User, ArrowRight, History } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import type { BookSummary } from "@/lib/hadith";

export default function BookBrowser({ books }: { books: BookSummary[] }) {
  const { lastReadChapter } = useHadithPreferences();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book, i) => {
        const resumeChapter = lastReadChapter(book.slug);
        return (
          <motion.div
            key={book.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: i * 0.05 }}
          >
            <Link
              href={
                resumeChapter
                  ? `/hadith/${book.slug}/${resumeChapter.bookNumber}/${resumeChapter.chapterNumber}`
                  : `/hadith/${book.slug}`
              }
              className="card-surface group relative flex h-full flex-col p-5 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  <BookOpen size={22} />
                </div>
                {resumeChapter && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                    style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                  >
                    <History size={11} /> Continue
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-[16.5px] font-semibold" style={{ color: "var(--text)" }}>
                {book.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
                <User size={12} /> {book.author}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]" style={{ color: "var(--faint)" }}>
                <span>{book.totalHadiths.toLocaleString()} hadiths</span>
                <span>{book.languages.length} languages</span>
              </div>

              <div className="mt-auto flex items-center gap-1.5 pt-4 text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
                {resumeChapter ? "Continue reading" : "Explore book"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
