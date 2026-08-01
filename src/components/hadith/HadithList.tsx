"use client";

import { useEffect, useRef, useState } from "react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import { HadithCardSkeleton } from "./Skeletons";
import { ErrorState, EmptyState } from "./StateViews";
import HadithCard from "./HadithCard";
import { BookOpen } from "lucide-react";
import type { Hadith, TextDirection } from "@/lib/hadith";

const LANGUAGE_NAMES: Record<string, string> = {
  ara: "Arabic",
  eng: "English",
  urd: "Urdu",
  ben: "Bengali",
  fra: "French",
  ind: "Indonesian",
  rus: "Russian",
  tur: "Turkish",
};

export default function HadithList({
  bookSlug,
  bookName,
  chapterNumber,
  initialChapterName,
  initialHadiths,
  initialDirection,
}: {
  bookSlug: string;
  bookName: string;
  chapterNumber: number;
  initialChapterName: string | null;
  initialHadiths: Hadith[];
  initialDirection: TextDirection;
}) {
  const { language, setLastReadChapter } = useHadithPreferences();
  const [hadiths, setHadiths] = useState<Hadith[]>(initialHadiths);
  const [chapterName, setChapterName] = useState<string | null>(initialChapterName);
  const [direction, setDirection] = useState<TextDirection>(initialDirection);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const loadedLangRef = useRef<string>("eng");

  async function load(lang: string) {
    setLoading(true);
    setErrored(false);
    try {
      const res = await fetch(`/api/hadith/${bookSlug}/${chapterNumber}?lang=${lang}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setHadiths(data.hadiths ?? []);
      setChapterName(data.chapter?.name ?? null);
      setDirection(data.direction ?? "ltr");
      loadedLangRef.current = lang;
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (language !== loadedLangRef.current) load(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Remember this as the last-read chapter for "Continue reading".
  useEffect(() => {
    setLastReadChapter(bookSlug, chapterNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug, chapterNumber]);

  if (loading) {
    return (
      <div className="space-y-4">
        <HadithCardSkeleton />
        <HadithCardSkeleton />
        <HadithCardSkeleton />
      </div>
    );
  }

  if (errored) {
    return <ErrorState onRetry={() => load(language)} />;
  }

  if (hadiths.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No hadiths in this chapter"
        description="This chapter doesn't have hadith text in the selected language yet. Try switching to another language from the header."
      />
    );
  }

  return (
    <div className="space-y-4">
      {chapterName && (
        <h2 dir={direction} className="text-[18px] font-semibold" style={{ color: "var(--text)" }}>
          {chapterName}
        </h2>
      )}
      {hadiths.map((h) => (
        <HadithCard
          key={h.hadithNumber}
          hadith={h}
          bookSlug={bookSlug}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          direction={direction}
          languageName={LANGUAGE_NAMES[language] ?? language}
        />
      ))}
    </div>
  );
}
