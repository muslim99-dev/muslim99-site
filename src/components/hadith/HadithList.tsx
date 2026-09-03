"use client";

import { useEffect } from "react";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import { EmptyState } from "./StateViews";
import HadithCard from "./HadithCard";
import { BookOpen } from "lucide-react";
import { useHadithEdition } from "@/lib/useHadithEdition";
import type { BookEdition, HadithLanguage, LanguageCode } from "@/lib/hadith";

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
  bookNumber,
  chapterNumber,
  initialEdition,
  initialLanguage,
  availableLanguages,
}: {
  bookSlug: string;
  bookName: string;
  bookNumber: number;
  chapterNumber: number;
  initialEdition: BookEdition;
  initialLanguage: LanguageCode;
  availableLanguages: HadithLanguage[];
}) {
  const { edition, direction, currentLanguage } = useHadithEdition(bookSlug, initialEdition, initialLanguage, availableLanguages);
  const chapterInfo = edition.chapters.find((c) => c.number === chapterNumber);
  const hadiths = edition.hadiths.filter((h) => h.chapterNumber === chapterNumber);
  const languageName = LANGUAGE_NAMES[currentLanguage] ?? currentLanguage;

  const { setLastReadChapter } = useHadithPreferences();

  // Remember this as the last-read chapter for "Continue reading".
  useEffect(() => {
    setLastReadChapter(bookSlug, bookNumber, chapterNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug, bookNumber, chapterNumber]);

  if (hadiths.length === 0) {
    return <EmptyState icon={BookOpen} title="No hadiths in this chapter" description="This chapter doesn't have hadith text yet." />;
  }

  return (
    <div className="space-y-4">
      {chapterInfo && (
        <h2 dir={direction} className="text-[18px] font-semibold" style={{ color: "var(--text)" }}>
          {chapterInfo.name}
        </h2>
      )}
      {hadiths.map((h) => (
        <HadithCard
          key={h.hadithNumber}
          hadith={h}
          bookSlug={bookSlug}
          bookName={bookName}
          chapterName={chapterInfo?.name ?? null}
          chapterNumber={chapterNumber}
          direction={direction}
          languageName={languageName}
          language={currentLanguage}
        />
      ))}
    </div>
  );
}
