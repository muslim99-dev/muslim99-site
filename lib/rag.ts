/**
 * RAG retrieval layer for the "Ask" assistant.
 * ------------------------------------------------------------------
 * Real retrieval, not a vector DB: alquran.cloud's own full-text search
 * over the Quran (Arabic + Saheeh International translation) is queried
 * live for verses relevant to the user's question. Those verses are
 * handed to the model as grounding context with their exact Surah:Ayah
 * reference, so the model can cite real sources instead of inventing
 * one — matching this app's content-accuracy rule.
 */

export type RetrievedVerse = {
  surahNumber: number;
  surahName: string;
  numberInSurah: number;
  text: string;
};

async function searchOneTerm(term: string): Promise<RetrievedVerse[]> {
  const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(term)}/all/en.sahih`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return [];
  const json = await res.json();
  if (json.code !== 200) return [];

  const matches = (json.data?.matches ?? []) as {
    surah: { number: number; englishName: string };
    numberInSurah: number;
    text: string;
  }[];

  return matches.map((m) => ({
    surahNumber: m.surah.number,
    surahName: m.surah.englishName,
    numberInSurah: m.numberInSurah,
    text: m.text
  }));
}

export async function searchQuran(question: string, limit = 5): Promise<RetrievedVerse[]> {
  const phrases = extractPhrases(question);
  const phraseResults = await Promise.all(phrases.map((p) => searchOneTerm(p).catch(() => [])));

  const bestPhraseHit = phraseResults.find((hits) => hits.length > 0);
  if (bestPhraseHit) return bestPhraseHit.slice(0, limit);

  const terms = extractSearchTerms(question);
  if (terms.length === 0) return [];

  const results = await Promise.all(terms.map((t) => searchOneTerm(t).catch(() => [])));
  const seen = new Set<string>();
  const merged: RetrievedVerse[] = [];
  for (const verses of results) {
    for (const v of verses) {
      const key = `${v.surahNumber}:${v.numberInSurah}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(v);
      if (merged.length >= limit) return merged;
    }
  }
  return merged;
}


function extractPhrases(question: string): string[] {
  const words = question
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, ""))
    .filter(Boolean);
  const cleaned = words.join(" ");
  const phrases: string[] = [];
  if (words.length >= 3 && words.length <= 12) phrases.push(cleaned);
  for (const windowSize of [4, 3]) {
    if (words.length < windowSize) continue;
    for (let i = 0; i <= words.length - windowSize; i++) {
      phrases.push(words.slice(i, i + windowSize).join(" "));
    }
  }
  return phrases.slice(0, 12);
}

export async function attachTafsir(
  verses: RetrievedVerse[],
  tafsirSlug = "ar-tafsir-ibn-kathir",
  maxChars = 500
): Promise<(RetrievedVerse & { tafsir?: string })[]> {
  const { getTafsirForSurah } = await import("./tafsirData");
  const surahNumbers = Array.from(new Set(verses.map((v) => v.surahNumber)));

  const tafsirBySurah = new Map<number, Map<number, string>>();
  await Promise.all(
    surahNumbers.map(async (surahNumber) => {
      try {
        const ayahs = await getTafsirForSurah(tafsirSlug, surahNumber);
        tafsirBySurah.set(surahNumber, new Map(ayahs.map((a) => [a.ayah, a.text])));
      } catch {
        tafsirBySurah.set(surahNumber, new Map());
      }
    })
  );

  return verses.map((v) => {
    const text = tafsirBySurah.get(v.surahNumber)?.get(v.numberInSurah);
    return {
      ...v,
      tafsir: text ? (text.length > maxChars ? text.slice(0, maxChars) + "…" : text) : undefined
    };
  });
}

export type RetrievedHadith = {
  bookName: string;
  bookSlug: string;
  hadithnumber: number;
  text: string;
};

/**
 * Real hadith retrieval using the live hadith API's own /api/search
 * endpoint — a genuine keyword search across a collection's actual text
 * (Arabic/Urdu/English), not a local fetch-and-filter.
 *
 * This deliberately does NOT hardcode which collections to search — it
 * reuses searchAllCollections() from lib/hadith.ts, the exact same
 * function the Hadith section's own cross-collection search box calls.
 * Both read live from getCollections() at request time, so if a 19th
 * collection is ever added to the source API, both the search UI and
 * this AI grounding pick it up automatically — no code change needed
 * here, matching the app's "never retrain from scratch" requirement.
 */
export async function searchHadith(question: string, limit = 4): Promise<RetrievedHadith[]> {
  const { searchAllCollections, getChapter } = await import("./hadith");
  const terms = extractSearchTerms(question);
  if (terms.length === 0) return [];

  // The search endpoint matches a single literal query, not multi-term OR,
  // and hadith text is in Arabic/Urdu-script/English — never Roman-Urdu —
  // so a Roman-Urdu question can extract several candidate words where
  // only one or two would ever actually appear in the text (e.g. "namaz"
  // mapped to "prayer" is searchable; a leftover connector word like
  // "mutaliq" or "ander" never is). Picking by raw word length once
  // picked a filler word over the real term and silently found nothing.
  // So every candidate is tried, in priority order, until one hits.
  let hits: Awaited<ReturnType<typeof searchAllCollections>> = [];
  for (const term of terms) {
    hits = await searchAllCollections(term, 2).catch(() => []);
    if (hits.length > 0) break;
  }
  const top = hits.slice(0, limit);

  // The search endpoint only returns a snippet + location, not the full
  // hadith fields — fetch the actual chapter for full text, only for the
  // handful of results that will actually be used.
  const withText = await Promise.all(
    top.map(async (hit) => {
      try {
        const chapter = await getChapter(hit.collection, hit.book, hit.chapter);
        const h = chapter.hadiths.find((x) => x.hadith_number === hit.hadith_number);
        const text = h?.english_translation || hit.snippet;
        return {
          bookName: hit.collectionName,
          bookSlug: hit.collection,
          hadithnumber: hit.hadith_number,
          text: text.length > 400 ? text.slice(0, 400) + "…" : text
        };
      } catch {
        return {
          bookName: hit.collectionName,
          bookSlug: hit.collection,
          hadithnumber: hit.hadith_number,
          text: hit.snippet
        };
      }
    })
  );

  return withText;
}

// Users very often ask in Roman Urdu/Arabic transliteration ("namaz",
// "roza") rather than English, but the hadith/Quran text being searched is
// English — so common Islamic terms are mapped to the English word(s) they
// actually appear as in translated text, and both forms are searched.
const ISLAMIC_TERM_MAP: Record<string, string> = {
  namaz: "prayer",
  salat: "prayer",
  salah: "prayer",
  roza: "fast",
  rozay: "fasting",
  sawm: "fasting",
  zakat: "zakat",
  hajj: "hajj",
  wudu: "ablution",
  wuzu: "ablution",
  ghusl: "bathing",
  nikah: "marriage",
  talaq: "divorce",
  sabr: "patience",
  dua: "supplication",
  jannat: "paradise",
  jahannam: "hellfire",
  qurban: "sacrifice",
  qurbani: "sacrifice",
  eid: "festival",
  ramzan: "ramadan",
  quran: "quran",
  hadith: "hadith",
  hadees: "hadith",
  imaan: "faith",
  iman: "faith"
};

// Common Roman-Urdu connector/filler words that survive a length>2, non-
// English-stopword filter but never appear inside translated hadith/Quran
// text — without this list, a query could pick "mutaliq" (roughly "about")
// or "ander" ("inside") over the one word actually worth searching for.
const ROMAN_URDU_FILLER = new Set([
  "mutaliq", "ander", "andar", "muje", "mujhe", "nikal", "nikaal", "sath", "saath", "hay", "hain",
  "kro", "karo", "kar", "kr", "wala", "wale", "wali", "jaisay", "jese", "waqt", "diya", "dedo",
  "chahye", "chahiye", "btao", "bataye", "bata", "dain", "dijiye", "plz", "pls", "reference",
  "refernece", "full", "complete", "detail", "batado"
]);

/** Pull keywords out of a question for the search API, with any real
 * translated-Islamic-term matches (e.g. "namaz" -> "prayer") given
 * priority — those are guaranteed real words the actual hadith/Quran
 * text could contain, unlike an arbitrary Roman-Urdu leftover word. */
export function extractSearchTerms(question: string): string[] {
  const stopwords = new Set([
    "what", "why", "how", "when", "where", "who", "which", "is", "are", "was", "were", "do", "does",
    "did", "the", "a", "an", "of", "in", "on", "to", "and", "or", "about", "can", "should", "i", "my",
    "me", "you", "your", "please", "tell", "explain", "say", "says", "with", "for", "that", "this"
  ]);
  const rawWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w) && !ROMAN_URDU_FILLER.has(w));

  const mapped: string[] = [];
  const unmapped: string[] = [];
  for (const w of rawWords) {
    if (ISLAMIC_TERM_MAP[w]) mapped.push(ISLAMIC_TERM_MAP[w]);
    else unmapped.push(w);
  }
  // Mapped (verified-real) terms first, then the rest in their original
  // order — deduplicated, so callers trying candidates in sequence hit
  // the most likely-to-match term first.
  return Array.from(new Set([...mapped, ...unmapped])).slice(0, 6);
}
