// Search across the hadith collection for a given language — loads that
// language's edition of all 6 books (cached per-language after first use,
// ~3-8MB each) rather than the full 238MB multi-language dataset, and does
// plain substring matching over hadith text, narrator, chapter name, and
// hadith/reference number. Filterable by book and grade.
import { getBooks, getBookEdition } from "./hadith.server";
import { splitNarrator, gradeTone, type LanguageCode } from "./hadith";

export interface HadithSearchResult {
  bookSlug: string;
  bookName: string;
  chapterNumber: number | null;
  chapterName: string | null;
  hadithNumber: number;
  narrator: string | null;
  excerpt: string;
  grade: string | null;
}

const MIN_QUERY_LENGTH = 2;

export async function searchHadiths(
  query: string,
  opts: { language: LanguageCode; bookSlug?: string; grade?: "sahih" | "hasan" | "daif" },
  limit = 30
): Promise<HadithSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];
  const q = trimmed.toLowerCase();

  const books = await getBooks();
  const targetBooks = opts.bookSlug ? books.filter((b) => b.slug === opts.bookSlug) : books;

  const results: HadithSearchResult[] = [];

  for (const book of targetBooks) {
    if (!book.languages.some((l) => l.code === opts.language)) continue;
    const edition = await getBookEdition(book.slug, opts.language);
    if (!edition) continue;

    const chapterByNumber = new Map(edition.chapters.map((c) => [c.number, c.name]));

    for (const h of edition.hadiths) {
      const { narrator, body } = splitNarrator(h.text);
      const chapterName = h.chapterNumber !== null ? chapterByNumber.get(h.chapterNumber) ?? null : null;
      const grade = h.grades[0]?.grade ?? null;

      if (opts.grade && gradeTone(grade) !== opts.grade) continue;

      const haystack = `${h.text} ${narrator ?? ""} ${chapterName ?? ""} ${h.hadithNumber}`.toLowerCase();
      if (!haystack.includes(q)) continue;

      const matchIndex = body.toLowerCase().indexOf(q);
      const excerptStart = matchIndex > 40 ? matchIndex - 40 : 0;
      const excerpt = (excerptStart > 0 ? "…" : "") + body.slice(excerptStart, excerptStart + 220) + (body.length > excerptStart + 220 ? "…" : "");

      results.push({
        bookSlug: book.slug,
        bookName: book.name,
        chapterNumber: h.chapterNumber,
        chapterName,
        hadithNumber: h.hadithNumber,
        narrator,
        excerpt,
        grade,
      });

      if (results.length >= limit * 4) break; // enough candidates to rank from without scanning forever
    }
  }

  // Prefer matches in the narrator/chapter/number (short, precise fields)
  // over a match buried in a long body of text.
  results.sort((a, b) => {
    const aStrong = (a.narrator?.toLowerCase().includes(q) ? 1 : 0) + (a.chapterName?.toLowerCase().includes(q) ? 1 : 0);
    const bStrong = (b.narrator?.toLowerCase().includes(q) ? 1 : 0) + (b.chapterName?.toLowerCase().includes(q) ? 1 : 0);
    return bStrong - aStrong;
  });

  return results.slice(0, limit);
}
