"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState, BookX } from "./StateViews";
import { useHadithEdition } from "@/lib/useHadithEdition";
import type { BookEdition, HadithLanguage, LanguageCode } from "@/lib/hadith";

const PAGE_SIZE = 13;

export default function BookList({
  bookSlug,
  initialEdition,
  initialLanguage,
  availableLanguages,
}: {
  bookSlug: string;
  initialEdition: BookEdition;
  initialLanguage: LanguageCode;
  availableLanguages: HadithLanguage[];
}) {
  const { edition, direction } = useHadithEdition(bookSlug, initialEdition, initialLanguage, availableLanguages);
  const books = edition.books;
  const [page, setPage] = useState(1);

  if (books.length === 0) {
    return <EmptyState icon={BookX} title="No books available" description="This collection doesn't have book data yet." />;
  }

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageBooks = books.slice(start, start + PAGE_SIZE);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  return (
    <div>
      <div className="space-y-2.5">
        {pageBooks.map((book, i) => (
          <motion.div
            key={book.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 14) * 0.02 }}
          >
            <Link
              href={`/hadith/${bookSlug}/${book.number}`}
              className="card-surface flex items-center gap-4 p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="w-6 shrink-0 text-center text-[14px] font-semibold" style={{ color: "var(--faint)" }}>
                {book.number}
              </span>
              <div className="min-w-0 flex-1">
                <p dir={direction} className="truncate text-[15px] font-semibold" style={{ color: "var(--primary)" }}>
                  {book.name}
                </p>
                <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
                  {book.totalChapters} chapter{book.totalChapters === 1 ? "" : "s"} · {book.totalHadiths} hadith{book.totalHadiths === 1 ? "" : "s"}
                </p>
              </div>
              {book.nativeName && (
                <p
                  dir="rtl"
                  className={`hidden shrink-0 text-[15px] sm:block ${book.nativeNameLang === "urd" ? "font-urdu" : "font-arabic-text"}`}
                  style={{ color: "var(--soft-text)" }}
                >
                  {book.nativeName}
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
