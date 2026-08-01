// Server-only module: reads the static hadith JSON from the filesystem.
// Do not import this from client components.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BookSummary, BookEdition, LanguageCode } from "./hadith";

const DATA_ROOT = join(process.cwd(), "public", "hadith_data");

let booksPromise: Promise<BookSummary[]> | null = null;

export async function getBooks(): Promise<BookSummary[]> {
  if (!booksPromise) {
    booksPromise = readFile(join(DATA_ROOT, "books.json"), "utf8").then((raw) => JSON.parse(raw));
  }
  return booksPromise;
}

export async function getBook(slug: string): Promise<BookSummary | null> {
  const books = await getBooks();
  return books.find((b) => b.slug === slug) ?? null;
}

// One in-memory cache per (book, language) — these files run 1-8MB each, so
// caching avoids re-reading/re-parsing on every request in a warm process.
const editionCache = new Map<string, Promise<BookEdition | null>>();

export async function getBookEdition(slug: string, language: LanguageCode): Promise<BookEdition | null> {
  const key = `${slug}/${language}`;
  if (!editionCache.has(key)) {
    editionCache.set(
      key,
      readFile(join(DATA_ROOT, slug, `${language}.json`), "utf8")
        .then((raw) => JSON.parse(raw) as BookEdition)
        .catch(() => null)
    );
  }
  return editionCache.get(key)!;
}
