// Types + helpers for the Quran section.
//
// The data is extracted into `public/quran_data/` as static JSON:
//   /quran_data/index.json                              -> SurahSummary[]
//   /quran_data/Surah_<n>/verses.json                   -> SurahFile (base verses)
//   /quran_data/Surah_<n>/verses/<m>/translations.json  -> Translation[]
//   /quran_data/Surah_<n>/verses/<m>/tafaseers.json     -> Tafseer[]
//   /quran_data/Surah_<n>/verses/<m>/root_words.json    -> RootWord[]
//   /quran_data/Surah_<n>/verses/<m>/w_by_w_translation.json -> WbwEntry[]
//
// Server components read the light files (index + verses) straight from the
// filesystem for SSG; the reader lazy-fetches the heavy per-verse files.

export type RevelationPlace = "Meccan" | "Medinan";

export interface SurahSummary {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  surahNameTranslation: string;
  revelationPlace: RevelationPlace;
  totalVerses: number;
  totalRukus: number;
  surahAudioUrl: string;
}

export interface VerseBase {
  verseNumber: number;
  verse: string;
  verseUrdu: string;
  verseEnglish: string;
  verseAudioUrl: string;
}

export interface SurahFile {
  details: SurahSummary;
  verses: VerseBase[];
}

export interface Translation {
  language: string;
  translator: string;
  text: string;
}

export interface Tafseer {
  name: string;
  author: string;
  text: string;
}

export interface RootWord {
  word: string;
  detailUrl: string;
}

export interface WbwWord {
  arabic: string;
  urdu: string;
}

export interface WbwEntry {
  translator: string;
  words: WbwWord[];
}

// ---- Public URL helpers (client-side fetch) --------------------------------

export const QURAN_BASE = "/quran_data";

export function verseFileUrl(
  surah: number,
  verseNumber: number,
  file: "translations" | "tafaseers" | "root_words" | "w_by_w_translation"
): string {
  return `${QURAN_BASE}/Surah_${surah}/verses/${verseNumber}/${file}.json`;
}

// ---- Formatting helpers ----------------------------------------------------

// A clean, transliteration-ish display name. The raw names look like
// "Surat ul Fateha" — we keep them but drop the redundant "Surat/Surah" prefix
// where a nicer label helps, while leaving the original intact for search.
export function surahDisplayName(s: SurahSummary): string {
  return s.surahName.replace(/^Sur[a]?[t|h]?\s+(ul\s+|ut\s+|un\s+|us\s+|Al-)?/i, "").trim() || s.surahName;
}

// Broad language grouping so a single filter covers the many translator rows.
export function languageGroup(language: string): "Urdu" | "English" | "Hindi" | "Other" {
  const l = language.toLowerCase();
  if (l.includes("urdu")) return "Urdu";
  if (l.includes("english")) return "English";
  if (l.includes("hindi")) return "Hindi";
  return "Other";
}

// Some verses embed Indo-Pak margin annotations (ruku end marker, ruku
// number, quarter/half markers like "النصف") directly in the Arabic text
// stream, trailing after the ayah's own ﴿...﴾ ornament. The ruku-end
// glyph is a Private-Use-Area codepoint from a specific print font we don't
// ship, so it renders as a blank "tofu" box — and everything after it is
// margin annotation, not ayah text. Truncate there, and separately drop any
// stray trailing ASCII ruku number for verses that carry one without a PUA
// glyph. Real ayah text never legitimately ends in a bare Western digit.
export function cleanVerseText(text: string): string {
  const puaIndex = text.search(/[-]/);
  const truncated = puaIndex === -1 ? text : text.slice(0, puaIndex);
  return truncated.replace(/\s*[0-9]+\s*$/, "").trim();
}
