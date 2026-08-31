// Types + client-safe helpers for the Hadith collection. Mirrors the Quran
// section's split: this file has no filesystem access (safe to import from
// client components); hadith.server.ts does the actual file reading.

export type LanguageCode = "ara" | "eng" | "urd" | "ben" | "fra" | "ind" | "rus" | "tur";
export type TextDirection = "ltr" | "rtl";

export interface HadithLanguage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: TextDirection;
}

export interface BookSummary {
  slug: string;
  name: string;
  author: string;
  authorYear: string;
  totalHadiths: number;
  languages: HadithLanguage[];
  // The language SSR/routing treats as authoritative for this book — not
  // every collection has full English coverage, so this isn't always "eng".
  defaultLanguage: LanguageCode;
  // false for large collections added later whose chapters render on
  // demand instead of being enumerated in generateStaticParams, to keep
  // `next build` fast. Defaults to true when absent (older data).
  prerender?: boolean;
}

export interface Chapter {
  number: number;
  name: string;
}

export interface HadithGrade {
  name: string;
  grade: string;
}

export interface AlternateTranslation {
  translator: string;
  text: string;
}

export interface Hadith {
  hadithNumber: number;
  arabicNumber: number;
  text: string;
  grades: HadithGrade[];
  chapterNumber: number | null;
  hadithInChapter: number | null;
  // Scholarly commentary/explanation of the hadith, when the source provides one.
  explanation?: string;
  // Other translators' renderings of the same hadith, beyond the primary `text`.
  alternateTranslations?: AlternateTranslation[];
}

export interface BookEdition {
  language: LanguageCode;
  direction: TextDirection;
  chapters: Chapter[];
  hadiths: Hadith[];
}

export const DEFAULT_LANGUAGE: LanguageCode = "eng";

// ---- Formatting helpers ----------------------------------------------------

// Many English/Urdu/etc. hadith texts begin "Narrated X:" — pull that out for
// a distinct narrator byline where present, without forcing it on languages
// or texts that don't follow the convention.
const NARRATED_PREFIX = /^(?:It (?:has been|was) narrated |Narrated )(?:on the authority of |that )?([^:]{2,80}):\s*/i;

export function splitNarrator(text: string): { narrator: string | null; body: string } {
  const match = text.match(NARRATED_PREFIX);
  if (!match) return { narrator: null, body: text };
  return { narrator: match[1].trim(), body: text.slice(match[0].length).trim() };
}

// A single best-effort grade label for compact display (e.g. a card badge),
// preferring the first scholar's grading. Full detail (all scholars) should
// still be shown wherever there's room.
export function primaryGrade(grades: HadithGrade[]): string | null {
  return grades[0]?.grade ?? null;
}

export function gradeTone(grade: string | null): "sahih" | "hasan" | "daif" | "neutral" {
  if (!grade) return "neutral";
  const g = grade.toLowerCase();
  if (g.includes("da'if") || g.includes("daif") || g.includes("weak")) return "daif";
  if (g.includes("hasan")) return "hasan";
  if (g.includes("sahih") || g.includes("sahîh")) return "sahih";
  return "neutral";
}

export function formatHadithForShare(opts: {
  bookName: string;
  chapterName?: string;
  hadithNumber: number;
  arabicText?: string;
  translatedText: string;
  languageName: string;
}): string {
  const lines = [
    opts.arabicText ? opts.arabicText : null,
    opts.translatedText,
    "",
    `— ${opts.bookName}${opts.chapterName ? `, ${opts.chapterName}` : ""}, Hadith ${opts.hadithNumber} (${opts.languageName})`,
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}
