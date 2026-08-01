// Site-wide search across the whole Quran in Arabic, English, Urdu, and
// Hindi — powers the search box on /quran, letting a user find a word or
// phrase without opening a specific surah first. Plain substring matching
// (normalized for Arabic/Urdu script and diacritics), not semantic search —
// fast, dependency-free, and predictable.
import { loadQuranSearchIndex } from "./quranSearch.server";
import { normalizeArabicForSearch } from "./quran";

export type MatchLanguage = "arabic" | "english" | "urdu" | "hindi";

export interface GlobalVerseMatch {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  surahNameTranslation: string;
  verseNumber: number;
  verse: string;
  verseEnglish: string;
  verseUrdu: string;
  verseHindi?: string;
  matchedIn: MatchLanguage[];
}

const MIN_QUERY_LENGTH = 2;

export async function searchQuranGlobal(query: string, limit = 25): Promise<GlobalVerseMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const lower = trimmed.toLowerCase();
  const arabicQuery = normalizeArabicForSearch(trimmed);
  const hasArabicQuery = arabicQuery.length >= MIN_QUERY_LENGTH;

  const verses = await loadQuranSearchIndex();
  const results: GlobalVerseMatch[] = [];

  for (const v of verses) {
    const matchedIn: MatchLanguage[] = [];

    if (hasArabicQuery && normalizeArabicForSearch(v.verse).includes(arabicQuery)) {
      matchedIn.push("arabic");
    }
    if (v.verseEnglish.toLowerCase().includes(lower)) {
      matchedIn.push("english");
    }
    if (hasArabicQuery && normalizeArabicForSearch(v.verseUrdu).includes(arabicQuery)) {
      matchedIn.push("urdu");
    }
    if (v.verseHindi?.includes(trimmed)) {
      matchedIn.push("hindi");
    }

    if (matchedIn.length > 0) {
      results.push({
        surahNumber: v.surahNumber,
        surahName: v.surahName,
        surahNameArabic: v.surahNameArabic,
        surahNameTranslation: v.surahNameTranslation,
        verseNumber: v.verseNumber,
        verse: v.verse,
        verseEnglish: v.verseEnglish,
        verseUrdu: v.verseUrdu,
        verseHindi: v.verseHindi,
        matchedIn,
      });
    }
  }

  // Verses matching in more languages (and shorter verses, where the match
  // makes up more of the ayah) rank first; ties keep Quran order.
  results.sort((a, b) => {
    if (b.matchedIn.length !== a.matchedIn.length) return b.matchedIn.length - a.matchedIn.length;
    return a.verseEnglish.length - b.verseEnglish.length;
  });

  return results.slice(0, limit);
}
