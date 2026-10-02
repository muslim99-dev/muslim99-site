"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getReadingHistory,
  onReadingHistoryChange,
  removeReadingPosition,
  timeAgo,
  type ReadingPosition
} from "@/lib/hadithHistory";
import { hadithHref } from "@/lib/hadithRefs";

/** "Continue reading" card(s). With `slug`, shows only that collection's
 * last position; otherwise the most recent few across all collections.
 * Renders nothing until there's history, so first-time visitors see no
 * empty box. */
export default function ContinueReading({
  slug,
  limit = 3,
  showLibraryLink = true
}: {
  slug?: string;
  limit?: number;
  showLibraryLink?: boolean;
}) {
  const [items, setItems] = useState<ReadingPosition[]>([]);

  useEffect(() => {
    const load = () => setItems(getReadingHistory().filter((p) => !slug || p.slug === slug).slice(0, limit));
    load();
    return onReadingHistoryChange(load);
  }, [slug, limit]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Continue reading">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-dark">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gold/15 text-gold" aria-hidden>
            ▶
          </span>
          Continue reading
        </h2>
        {!slug && showLibraryLink && (
          <Link href="/hadith/saved" className="text-xs font-medium text-primary-deep hover:underline">
            My Hadith →
          </Link>
        )}
      </div>
      <div className={`mt-3 grid gap-3 ${slug ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {items.map((p) => (
          <div
            key={p.slug}
            className="group relative flex items-center gap-4 rounded-card border border-gold/30 bg-gradient-to-br from-white to-[#FBF7EA] p-4 transition-shadow hover:shadow-card"
          >
            <Link
              href={hadithHref({ slug: p.slug, book: p.book, chapter: p.chapter, hadith: p.hadith })}
              className="absolute inset-0 rounded-card"
              aria-label={`Continue ${p.collectionName} at hadith ${p.hadith}`}
            />
            <span className="grid h-11 min-w-11 place-items-center rounded-xl bg-teal-dark px-2 text-sm font-semibold tabular-nums text-white">
              {p.hadith}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-teal-dark group-hover:text-primary-deep">{p.collectionName}</p>
              <p dir="auto" className="text-xs text-muted line-clamp-1">
                Book {p.book} · {p.chapterTitle}
              </p>
              <p className="mt-0.5 text-[11px] text-gold">{timeAgo(p.at)}</p>
            </div>
            <button
              onClick={() => removeReadingPosition(p.slug)}
              className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted opacity-60 hover:bg-white hover:opacity-100"
              aria-label={`Clear ${p.collectionName} from continue reading`}
              title="Clear"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
