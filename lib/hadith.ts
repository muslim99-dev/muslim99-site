/**
 * HadithProvider
 * ------------------------------------------------------------------
 * Source: a live REST API (Express + on-disk JSON, no database) serving
 * 18 classical hadith collections — Sahih Bukhari, Sahih Muslim, Musnad
 * Ahmad, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn
 * Majah, Muwatta Malik, Mishkat al-Masabih, Al-Adab Al-Mufrad, and more —
 * each hadith carrying Arabic text, English translation, multiple Urdu
 * translator variants, and a grading/status where the source provides
 * one. Nothing here is hardcoded or generated — every collection, book,
 * chapter, and hadith is fetched live from this API.
 */

const BASE_URL = "https://white-weasel-747980.hostingersite.com";

async function getJSON<T>(path: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`Hadith API request failed: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export type Collection = {
  slug: string;
  name: string;
  name_arabic: string;
  name_urdu: string;
  total_hadiths: number;
  total_books: number;
};

export async function getCollections(): Promise<Collection[]> {
  const data = await getJSON<{ collections: Collection[] }>("/api/collections", 3600);
  return data.collections;
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  try {
    return await getJSON<Collection>(`/api/collections/${slug}`, 3600);
  } catch {
    return undefined;
  }
}

export type Book = {
  collection: string;
  number: number;
  arabic: string;
  urdu: string;
  english: string;
  total_chapters: number;
  total_hadiths: number;
};

export async function getBooks(slug: string): Promise<Book[]> {
  const data = await getJSON<{ collection: string; books: Book[] }>(`/api/collections/${slug}/books`, 3600);
  return data.books;
}

export async function getBook(slug: string, bookNumber: number): Promise<Book | undefined> {
  try {
    return await getJSON<Book>(`/api/collections/${slug}/books/${bookNumber}`, 3600);
  } catch {
    return undefined;
  }
}

export async function getChapterNumbers(slug: string, bookNumber: number): Promise<number[]> {
  const data = await getJSON<{ chapters: { number: number }[] }>(
    `/api/collections/${slug}/books/${bookNumber}/chapters`,
    3600
  );
  return data.chapters.map((c) => c.number);
}

export type UrduTranslation = { translator: string; text: string };

export type Hadith = {
  hadith_number: number;
  arabic_text: string;
  urdu_translation: string;
  english_translation: string;
  status?: string;
  urdu_translations?: UrduTranslation[];
  reference?: unknown;
};

export type Chapter = {
  collection: string;
  book: number;
  number: number;
  arabic: string;
  urdu: string;
  english: string;
  total_hadiths: number;
  hadiths: Hadith[];
};

export async function getChapter(slug: string, bookNumber: number, chapterNumber: number): Promise<Chapter> {
  return getJSON<Chapter>(`/api/collections/${slug}/books/${bookNumber}/chapters/${chapterNumber}`, 3600);
}

export async function getHadithByNumber(slug: string, hadithNumber: number) {
  return getJSON<{ collection: string; book: number; chapter: number; hadith: Hadith }>(
    `/api/collections/${slug}/hadith/${hadithNumber}`,
    3600
  );
}

export type SearchResult = {
  collection: string;
  book: number;
  chapter: number;
  hadith_number: number;
  status?: string;
  snippet: string;
};

export async function searchCollection(
  slug: string,
  query: string,
  options?: { book?: number; limit?: number; offset?: number }
): Promise<SearchResult[]> {
  const params = new URLSearchParams({ collection: slug, q: query });
  if (options?.book) params.set("book", String(options.book));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  const data = await getJSON<{ results: SearchResult[] }>(`/api/search?${params}`, 300);
  return data.results;
}

/**
 * Which languages a collection actually has isn't uniform — some (e.g.
 * Sahih Bukhari, Sahih Muslim, Jami at-Tirmidhi) include an English
 * translation, others (e.g. Al-Mustadrak, Musnad Ahmad) only have Arabic
 * and Urdu. Rather than hardcode that (it could be wrong, and the source
 * doesn't publish it directly), this samples one real hadith from the
 * collection and checks which text fields are actually populated.
 */
export async function getCollectionLanguages(slug: string): Promise<string[]> {
  try {
    const books = await getBooks(slug);
    if (books.length === 0) return [];
    for (const book of books.slice(0, 3)) {
      const numbers = await getChapterNumbers(slug, book.number);
      for (const chapterNumber of numbers.slice(0, 3)) {
        try {
          const chapter = await getChapter(slug, book.number, chapterNumber);
          const h = chapter.hadiths?.[0];
          if (!h) continue;
          const langs: string[] = [];
          if (h.arabic_text) langs.push("Arabic");
          if (h.urdu_translation) langs.push("Urdu");
          if (h.english_translation) langs.push("English");
          if (langs.length > 0) return langs;
        } catch {
          continue;
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

export type BookMatch = { number: number; title: string; totalHadiths: number };

/** Matches against the book's own title fields and its number — cheap,
 * since getBooks fetches every book in one call. */
export async function searchBooks(slug: string, query: string): Promise<BookMatch[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const books = await getBooks(slug);
  return books
    .filter(
      (b) =>
        String(b.number) === q ||
        b.english?.toLowerCase().includes(q) ||
        b.urdu?.includes(query.trim()) ||
        b.arabic?.includes(query.trim())
    )
    .map((b) => ({ number: b.number, title: b.english || b.urdu || `Book ${b.number}`, totalHadiths: b.total_hadiths }));
}

export type ChapterMatch = { number: number; title: string; totalHadiths: number };

/** Matches against chapter titles and chapter numbers within one book.
 * There's no lightweight "chapter titles" endpoint — a chapter's title
 * only comes back together with its full hadith text — so this fetches
 * every chapter in the book (capped, since a handful of books run into
 * the hundreds of chapters) rather than every chapter in the collection. */
export async function searchChapterTitles(
  slug: string,
  bookNumber: number,
  query: string,
  maxChapters = 80
): Promise<ChapterMatch[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const numbers = (await getChapterNumbers(slug, bookNumber)).slice(0, maxChapters);
  const chapters = await Promise.all(
    numbers.map(async (n) => {
      try {
        return await getChapter(slug, bookNumber, n);
      } catch {
        return null;
      }
    })
  );
  return chapters
    .filter((c): c is Chapter => {
      if (!c) return false;
      return (
        String(c.number) === q ||
        c.english?.toLowerCase().includes(q) ||
        c.urdu?.includes(query.trim()) ||
        c.arabic?.includes(query.trim())
      );
    })
    .map((c) => ({ number: c.number, title: c.english || c.urdu || `Chapter ${c.number}`, totalHadiths: c.total_hadiths }));
}

export type SearchResultWithCollection = SearchResult & { collectionName: string };

/** Searches every collection in parallel (the search endpoint always
 * scopes to one collection server-side, so there's no single "search
 * everything" call — see the README's design notes on why /api/search
 * requires a collection). Used where there's no collection context yet,
 * e.g. the top-level Hadith page. */
export async function searchAllCollections(query: string, limitPerCollection = 3): Promise<SearchResultWithCollection[]> {
  const collections = await getCollections();
  const results = await Promise.all(
    collections.map(async (c) => {
      try {
        const hits = await searchCollection(c.slug, query, { limit: limitPerCollection });
        return hits.map((h) => ({ ...h, collectionName: c.name }));
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}
