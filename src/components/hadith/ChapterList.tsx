"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, History } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import { ChapterRowSkeleton } from "./Skeletons";
import { ErrorState, EmptyState, BookX } from "./StateViews";
import type { Chapter, HadithLanguage, LanguageCode, TextDirection } from "@/lib/hadith";

export default function ChapterList({
  bookSlug,
  initialChapters,
  initialDirection,
  initialLanguage,
  availableLanguages,
}: {
  bookSlug: string;
  initialChapters: Chapter[];
  initialDirection: TextDirection;
  initialLanguage: LanguageCode;
  availableLanguages: HadithLanguage[];
}) {
  const { language, lastReadChapter } = useHadithPreferences();
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [direction, setDirection] = useState<TextDirection>(initialDirection);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const loadedLangRef = useRef<string>(initialLanguage);

  async function load(lang: string) {
    setLoading(true);
    setErrored(false);
    try {
      const res = await fetch(`/api/hadith/${bookSlug}/chapters?lang=${lang}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setChapters(data.chapters ?? []);
      setDirection(data.direction ?? "ltr");
      loadedLangRef.current = lang;
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (language !== loadedLangRef.current && availableLanguages.some((l) => l.code === language)) load(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const resumeChapter = lastReadChapter(bookSlug);

  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ChapterRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (errored) {
    return <ErrorState onRetry={() => load(language)} />;
  }

  if (chapters.length === 0) {
    return (
      <EmptyState
        icon={BookX}
        title="No chapters available"
        description="This book doesn't have chapter data in the selected language yet. Try switching languages."
      />
    );
  }

  return (
    <div dir={direction} className="space-y-2.5">
      {chapters.map((chapter, i) => (
        <motion.div
          key={chapter.number}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i, 14) * 0.02 }}
        >
          <Link
            href={`/hadith/${bookSlug}/${chapter.number}`}
            className="card-surface flex items-center gap-4 p-4 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--soft)", color: "var(--primary)" }}
            >
              {chapter.number}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium" style={{ color: "var(--text)" }} dir={direction}>
              {chapter.name}
            </span>
            {resumeChapter === chapter.number && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
              >
                <History size={10} /> Last read
              </span>
            )}
            <ChevronRight size={16} className="shrink-0" style={{ color: "var(--faint)" }} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
