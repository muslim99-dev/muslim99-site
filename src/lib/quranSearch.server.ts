// Server-only lightweight keyword search over the extracted Quran data, used
// to ground the AI assistant's answers in this site's actual verse text
// instead of relying purely on the model's training data. Not semantic
// search — plain keyword overlap over the English translation — but it's
// fast, has zero external dependencies, and is good enough to surface
// relevant ayat for grounding + citation.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SurahSummary, VerseBase } from "./quran";

interface IndexedVerse {
  surahNumber: number;
  surahName: string;
  surahNameTranslation: string;
  verseNumber: number;
  verse: string;
  verseEnglish: string;
}

const DATA_ROOT = join(process.cwd(), "public", "quran_data");

let indexPromise: Promise<IndexedVerse[]> | null = null;

async function loadIndex(): Promise<IndexedVerse[]> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const raw = await readFile(join(DATA_ROOT, "index.json"), "utf8");
      const surahs: SurahSummary[] = JSON.parse(raw);
      const all: IndexedVerse[] = [];
      await Promise.all(
        surahs.map(async (s) => {
          const surahRaw = await readFile(join(DATA_ROOT, `Surah_${s.surahNumber}`, "verses.json"), "utf8");
          const data: { verses: VerseBase[] } = JSON.parse(surahRaw);
          for (const v of data.verses) {
            all.push({
              surahNumber: s.surahNumber,
              surahName: s.surahName,
              surahNameTranslation: s.surahNameTranslation,
              verseNumber: v.verseNumber,
              verse: v.verse,
              verseEnglish: v.verseEnglish,
            });
          }
        })
      );
      return all;
    })();
  }
  return indexPromise;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "in", "on", "to", "and", "is", "are", "was", "were", "what", "how", "why",
  "does", "do", "did", "who", "which", "for", "about", "tell", "me", "please", "can", "you", "explain",
  "with", "that", "this", "it", "be", "as", "at", "by", "from", "or", "so", "we", "i", "my", "your",
  "quran", "verse", "verses", "ayah", "ayat", "surah", "chapter", "says", "say", "said", "there",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z']+/g) ?? []).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export interface VerseMatch {
  surahNumber: number;
  surahName: string;
  surahNameTranslation: string;
  verseNumber: number;
  verse: string;
  verseEnglish: string;
  score: number;
}

export async function searchVerses(query: string, limit = 6): Promise<VerseMatch[]> {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const verses = await loadIndex();
  const scored: VerseMatch[] = [];
  for (const v of verses) {
    const haystack = v.verseEnglish.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (haystack.includes(t)) score += 1;
    }
    if (score > 0) scored.push({ ...v, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
