/**
 * HadithProvider
 * ------------------------------------------------------------------
 * Source: the local on-disk dataset in data/hadith_data (unzipped from
 * hadith_data.zip) — 18 classical hadith collections, each hadith carrying
 * Arabic text, Urdu translation (often several translator variants), an
 * English translation where the source has one, a grading, a reference
 * number and, for some collections, an Urdu explanation (sharh).
 *
 * Browsing and search read two indexes generated from that dataset by
 * `node scripts/build-hadith-index.mjs` (data/hadith_index): a manifest of
 * every collection/book/chapter with titles and real counts, and a compact
 * per-collection search index. Full hadith text is read straight from the
 * chapter JSON files. Everything is cached in memory after the first read.
 *
 * Server-only: uses the filesystem.
 */
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "hadith_data");
const INDEX_DIR = path.join(process.cwd(), "data", "hadith_index");

// Survives dev-mode module reloads so the indexes aren't re-parsed per edit.
const cache = ((globalThis as any).__hadithCache ??= {
  manifest: null as Promise<Manifest> | null,
  search: new Map<string, Promise<SearchRow[]>>(),
  chapters: new Map<string, Promise<Chapter>>()
}) as {
  manifest: Promise<Manifest> | null;
  search: Map<string, Promise<SearchRow[]>>;
  chapters: Map<string, Promise<Chapter>>;
};

async function readJSON<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

export type ChapterSummary = {
  number: number;
  arabic: string;
  urdu: string;
  english: string;
  total_hadiths: number;
};

export type Book = {
  collection: string;
  number: number;
  arabic: string;
  urdu: string;
  english: string;
  total_chapters: number;
  total_hadiths: number;
};

export type Collection = {
  slug: string;
  name: string;
  name_arabic: string;
  name_urdu: string;
  total_hadiths: number;
  total_books: number;
  languages: string[];
};

type ManifestCollection = Omit<Collection, "languages"> & {
  dir: string;
  languages: string[];
  books: (Omit<Book, "collection"> & { chapters: ChapterSummary[] })[];
};
type Manifest = { collections: ManifestCollection[] };

function loadManifest(): Promise<Manifest> {
  if (!cache.manifest) {
    cache.manifest = readJSON<Manifest>(path.join(INDEX_DIR, "manifest.json")).catch((err) => {
      cache.manifest = null;
      throw new Error(
        `Hadith index missing — run "node scripts/build-hadith-index.mjs" after unzipping hadith_data.zip into data/. (${err})`
      );
    });
  }
  return cache.manifest;
}

async function findCollection(slug: string) {
  const { collections } = await loadManifest();
  return collections.find((c) => c.slug === slug);
}

async function findBook(slug: string, bookNumber: number) {
  return (await findCollection(slug))?.books.find((b) => b.number === bookNumber);
}

function toCollection(c: ManifestCollection): Collection {
  const { slug, name, name_arabic, name_urdu, total_hadiths, total_books, languages } = c;
  return { slug, name, name_arabic, name_urdu, total_hadiths, total_books, languages };
}

function toBook(slug: string, b: ManifestCollection["books"][number]): Book {
  const { chapters: _chapters, ...rest } = b;
  return { collection: slug, ...rest };
}

export async function getCollections(): Promise<Collection[]> {
  return (await loadManifest()).collections.map(toCollection);
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  const c = await findCollection(slug);
  return c && toCollection(c);
}

export async function getBooks(slug: string): Promise<Book[]> {
  const c = await findCollection(slug);
  if (!c) throw new Error(`Unknown hadith collection: ${slug}`);
  return c.books.map((b) => toBook(slug, b));
}

export async function getBook(slug: string, bookNumber: number): Promise<Book | undefined> {
  const b = await findBook(slug, bookNumber);
  return b && toBook(slug, b);
}

/** Chapter titles and counts for one book, without loading hadith text. */
export async function getChapters(slug: string, bookNumber: number): Promise<ChapterSummary[]> {
  return (await findBook(slug, bookNumber))?.chapters ?? [];
}

export async function getChapterNumbers(slug: string, bookNumber: number): Promise<number[]> {
  return (await getChapters(slug, bookNumber)).map((c) => c.number);
}

/** Previous/next chapter across book boundaries, for reader navigation. */
export async function getAdjacentChapters(slug: string, bookNumber: number, chapterNumber: number) {
  const c = await findCollection(slug);
  if (!c) return { prev: null, next: null };
  const flat = c.books.flatMap((b) => b.chapters.map((ch) => ({ book: b.number, ...ch })));
  const i = flat.findIndex((x) => x.book === bookNumber && x.number === chapterNumber);
  return { prev: i > 0 ? flat[i - 1] : null, next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null };
}

export type UrduTranslation = { translator: string; text: string };

export type Hadith = {
  hadith_number: number;
  arabic_text: string;
  urdu_translation: string;
  english_translation: string;
  status?: string;
  urdu_translations?: UrduTranslation[];
  reference?: { international_number?: string; arabic_number?: string };
  explanation?: string;
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
  const key = `${slug}/${bookNumber}/${chapterNumber}`;
  let pending = cache.chapters.get(key);
  if (!pending) {
    pending = (async () => {
      const c = await findCollection(slug);
      if (!c) throw new Error(`Unknown hadith collection: ${slug}`);
      const file = path.join(DATA_DIR, c.dir, "books", `Book_${bookNumber}`, "chapters", `chap_${chapterNumber}.json`);
      const raw = await readJSON<Omit<Chapter, "collection" | "book">>(file);
      const hadiths = raw.hadiths ?? [];
      return { ...raw, collection: slug, book: bookNumber, number: chapterNumber, total_hadiths: hadiths.length, hadiths };
    })();
    pending.catch(() => cache.chapters.delete(key));
    // Chapters are read on demand; keep the cache bounded.
    if (cache.chapters.size > 300) cache.chapters.delete(cache.chapters.keys().next().value!);
    cache.chapters.set(key, pending);
  }
  return pending;
}

// ---------------------------------------------------------------- search

/** [book, chapter, hadith_number, status, normalized text] */
type SearchRow = [number, number, number, string, string];

/** Must stay in sync with normalize() in scripts/build-hadith-index.mjs —
 * strips Arabic diacritics and unifies letter variants so a query typed
 * without harakat still matches fully vocalized text. */
export function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function loadSearchIndex(slug: string): Promise<SearchRow[]> {
  let pending = cache.search.get(slug);
  if (!pending) {
    pending = readJSON<SearchRow[]>(path.join(INDEX_DIR, "search", `${slug}.json`));
    pending.catch(() => cache.search.delete(slug));
    cache.search.set(slug, pending);
  }
  return pending;
}

function snippetAround(text: string, at: number, length: number): string {
  const start = Math.max(0, at - 80);
  const end = Math.min(text.length, at + length + 160);
  const body = text.slice(start, end).replace(/ ‖ /g, " · ");
  return (start > 0 ? "…" : "") + body + (end < text.length ? "…" : "");
}

export type SearchResult = {
  collection: string;
  book: number;
  chapter: number;
  hadith_number: number;
  status?: string;
  snippet: string;
};

/** Phrase matches rank first, then hadiths containing every query word. */
export async function searchCollection(
  slug: string,
  query: string,
  options?: { book?: number; chapter?: number; limit?: number; offset?: number }
): Promise<SearchResult[]> {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ").filter(Boolean);
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const rows = await loadSearchIndex(slug);

  const phrase: SearchResult[] = [];
  const allWords: SearchResult[] = [];
  const seen = new Set<number>();
  for (const [book, chapter, n, status, text] of rows) {
    if (options?.book && book !== options.book) continue;
    if (options?.chapter && chapter !== options.chapter) continue;
    if (seen.has(n)) continue;
    const at = text.indexOf(q);
    if (at >= 0) {
      seen.add(n);
      phrase.push({ collection: slug, book, chapter, hadith_number: n, status, snippet: snippetAround(text, at, q.length) });
    } else if (words.length > 1 && allWords.length < offset + limit && words.every((w) => text.includes(w))) {
      seen.add(n);
      const first = text.indexOf(words[0]);
      allWords.push({ collection: slug, book, chapter, hadith_number: n, status, snippet: snippetAround(text, first, words[0].length) });
    }
    if (phrase.length >= offset + limit) break;
  }
  return [...phrase, ...allWords].slice(offset, offset + limit);
}

export async function getHadithByNumber(slug: string, hadithNumber: number) {
  const rows = await loadSearchIndex(slug);
  const row = rows.find((r) => r[2] === hadithNumber);
  if (!row) throw new Error(`Hadith ${hadithNumber} not found in ${slug}`);
  const chapter = await getChapter(slug, row[0], row[1]);
  const hadith = chapter.hadiths.find((h) => h.hadith_number === hadithNumber)!;
  return { collection: slug, book: row[0], chapter: row[1], hadith };
}

/** Which languages a collection actually has, computed from the data at
 * index-build time (some collections have no English translation). */
export async function getCollectionLanguages(slug: string): Promise<string[]> {
  return (await getCollection(slug))?.languages ?? [];
}

export type BookMatch = { number: number; title: string; totalHadiths: number };

export async function searchBooks(slug: string, query: string): Promise<BookMatch[]> {
  const q = normalize(query);
  if (!q) return [];
  const books = await getBooks(slug);
  return books
    .filter(
      (b) =>
        String(b.number) === q ||
        normalize(b.english).includes(q) ||
        normalize(b.urdu).includes(q) ||
        normalize(b.arabic).includes(q)
    )
    .map((b) => ({ number: b.number, title: b.english || b.urdu || `Book ${b.number}`, totalHadiths: b.total_hadiths }));
}

export type ChapterMatch = { number: number; title: string; totalHadiths: number };

export async function searchChapterTitles(slug: string, bookNumber: number, query: string): Promise<ChapterMatch[]> {
  const q = normalize(query);
  if (!q) return [];
  const chapters = await getChapters(slug, bookNumber);
  return chapters
    .filter(
      (c) =>
        String(c.number) === q ||
        normalize(c.english).includes(q) ||
        normalize(c.urdu).includes(q) ||
        normalize(c.arabic).includes(q)
    )
    .map((c) => ({ number: c.number, title: c.english || c.urdu || c.arabic || `Chapter ${c.number}`, totalHadiths: c.total_hadiths }));
}

export type SearchResultWithCollection = SearchResult & { collectionName: string };

/** Searches every collection. Used where there's no collection context
 * yet, e.g. the top-level Hadith page and the Ask assistant's retrieval. */
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
