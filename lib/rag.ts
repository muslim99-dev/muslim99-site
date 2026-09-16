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

/** The search API matches on an exact literal substring — so a natural
 * phrase like "Night of Decree" finds exactly the right 3 verses, while
 * decomposing it into single words like "night" (98 matches) or "decree"
 * (63 matches) buries the right answer in noise. Phrases are tried first,
 * from longest/most specific to shortest, and only if none of them find
 * anything does it fall back to merging individual keyword matches. */
export async function searchQuran(question: string, limit = 5): Promise<RetrievedVerse[]> {
  const phrases = extractPhrases(question);
  const phraseResults = await Promise.all(phrases.map((p) => searchOneTerm(p).catch(() => [])));
  // Prefer the longest phrase that actually matched something (earlier in
  // the list = longer/more specific, from extractPhrases's ordering).
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

/** Candidate phrases to try as exact substrings, longest first: the whole
 * cleaned question, then sliding windows of the original words (kept in
 * their natural order, short words included, since a real phrase like
 * "Night of Decree" needs "of" to match). */
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

/**
 * Enriches retrieved verses with a short excerpt of classical tafsir
 * commentary (Ibn Kathir by default), so the model can ground answers in
 * scholarly explanation, not just the bare ayah text. Fetches are grouped
 * by surah (one request per distinct surah among the results, reused
 * across every verse from that surah) rather than one per verse.
 */
export async function attachTafsir(
  verses: RetrievedVerse[],
  tafsirSlug = "ar-tafsir-ibn-kathir",
  maxChars = 500
): Promise<(RetrievedVerse & { tafsir?: string })[]> {
  const { getTafsirForSurah } = await import("./tafsir");
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
 * Real hadith retrieval: unlike the Quran, there's no hosted search API for
 * this dataset, so the actual book JSON (already used by the site's /hadith
 * pages — see lib/hadith.ts) is fetched and searched locally by keyword.
 * Limited to Bukhari and Muslim by default (the two largest, most commonly
 * asked-about collections) to keep latency reasonable — searching all 10
 * books' full text on every question would be slow.
 */
export async function searchHadith(
  question: string,
  limit = 4,
  bookSlugs: string[] = ["bukhari", "muslim"]
): Promise<RetrievedHadith[]> {
  const { getHadithBook, getHadithEdition } = await import("./hadith");
  const terms = extractSearchTerms(question);
  if (terms.length === 0) return [];

  const results = await Promise.all(
    bookSlugs.map(async (slug) => {
      try {
        const book = await getHadithBook(slug);
        const englishEdition = book?.editions.find((e) => e.language === "English");
        if (!englishEdition) return [];
        const edition = await getHadithEdition(englishEdition.name);
        return edition.hadiths
          .filter((h) => terms.some((t) => h.text.toLowerCase().includes(t)))
          .slice(0, limit)
          .map((h) => ({
            bookName: book!.name,
            bookSlug: slug,
            hadithnumber: h.hadithnumber,
            text: h.text.length > 400 ? h.text.slice(0, 400) + "…" : h.text
          }));
      } catch {
        return [];
      }
    })
  );

  return results.flat().slice(0, limit);
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
  imaan: "faith",
  iman: "faith"
};

/** Pull a handful of keywords out of a question for the search API. */
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
    .filter((w) => w.length > 2 && !stopwords.has(w));

  const words = rawWords.flatMap((w) => (ISLAMIC_TERM_MAP[w] ? [ISLAMIC_TERM_MAP[w]] : [w]));
  return Array.from(new Set(words)).slice(0, 4);
}
