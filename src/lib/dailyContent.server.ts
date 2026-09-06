// Deterministically picks a "Verse of the day" and "Hadith of the day" from
// the site's own Quran/Hadith datasets, rotating once per calendar day (same
// pick for everyone on a given day, changes at midnight server time) rather
// than showing a single fixed pair forever.

import { getSurah } from "./quran.server";
import { getBook, getBookEdition } from "./hadith.server";
import { cleanVerseText } from "./quran";
import { splitNarrator, primaryGrade } from "./hadith";

const TOTAL_SURAHS = 114;
// Classical, widely-quoted, English-default collections — good fits for a
// short daily excerpt. Rotates across both for variety.
const HADITH_COLLECTIONS = ["bukhari", "muslim"] as const;
// Keeps the card readable — long, multi-part hadiths don't fit a shareable
// quote card well.
const MAX_HADITH_LENGTH = 260;

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / 86400000);
}

export interface VerseOfDay {
  arabic: string;
  english: string;
  surahName: string;
  surahNumber: number;
  verseNumber: number;
}

export interface HadithOfDay {
  arabic: string | null;
  english: string;
  collectionName: string;
  bookNumber: number | null;
  hadithNumber: number;
  grade: string | null;
}

export async function getVerseOfDay(date: Date = new Date()): Promise<VerseOfDay | null> {
  const seed = dayOfYear(date);
  const surahNumber = (seed % TOTAL_SURAHS) + 1;
  const surah = await getSurah(surahNumber);
  if (!surah) return null;

  // Skip the standalone Bismillah entry (verseNumber 0) where present — it
  // isn't really "a verse" on its own for this kind of excerpt.
  const verses = surah.verses.filter((v) => v.verseNumber !== 0);
  if (verses.length === 0) return null;
  const verse = verses[seed % verses.length];

  return {
    arabic: cleanVerseText(verse.verse),
    english: verse.verseEnglish,
    surahName: surah.details.surahName,
    surahNumber: surah.details.surahNumber,
    verseNumber: verse.verseNumber,
  };
}

export async function getHadithOfDay(date: Date = new Date()): Promise<HadithOfDay | null> {
  const seed = dayOfYear(date);
  const slug = HADITH_COLLECTIONS[seed % HADITH_COLLECTIONS.length];
  const book = await getBook(slug);
  if (!book) return null;
  const edition = await getBookEdition(slug, book.defaultLanguage);
  if (!edition) return null;

  const candidates = edition.hadiths
    .map((h) => ({ hadith: h, body: splitNarrator(h.text).body }))
    .filter(({ body }) => body.trim().length > 0 && body.trim().length <= MAX_HADITH_LENGTH);
  if (candidates.length === 0) return null;

  const pick = candidates[seed % candidates.length];
  const chapter = edition.chapters.find((c) => c.number === pick.hadith.chapterNumber);

  // Best-effort: pair the same hadith's Arabic wording alongside the English
  // translation, matched by hadithNumber. This is the original text as
  // narrated (including the isnad/chain of narrators), not a clean
  // matn-only extract — there's no reliable way to strip the chain
  // generically across collections.
  let arabic: string | null = null;
  if (book.languages.some((l) => l.code === "ara")) {
    const arabicEdition = await getBookEdition(slug, "ara");
    arabic = arabicEdition?.hadiths.find((h) => h.hadithNumber === pick.hadith.hadithNumber)?.text ?? null;
  }

  return {
    arabic,
    english: pick.body,
    collectionName: book.name,
    bookNumber: chapter?.bookNumber ?? null,
    hadithNumber: pick.hadith.hadithNumber,
    grade: primaryGrade(pick.hadith.grades),
  };
}
