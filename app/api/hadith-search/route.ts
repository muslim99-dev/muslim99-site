import { NextRequest, NextResponse } from "next/server";
import { searchCollection, searchAllCollections, searchBooks, searchChapterTitles } from "@/lib/hadith";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const collection = searchParams.get("collection") ?? undefined;
  const bookParam = searchParams.get("book");
  const book = bookParam ? Number(bookParam) : undefined;
  const chapterParam = searchParams.get("chapter");
  const chapter = chapterParam ? Number(chapterParam) : undefined;
  // Each page in the Hadith section only searches the thing it's actually
  // listing — a book-list page searches book names, a chapter-list page
  // searches chapter titles/numbers, a hadith page searches hadith text.
  // Mixing all three into every result set made the search feel unfocused.
  const mode = searchParams.get("mode") ?? "hadiths";

  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });
  if (q.length > 200) return NextResponse.json({ error: "Query too long" }, { status: 400 });

  try {
    if (mode === "books") {
      if (!collection) return NextResponse.json({ error: "collection is required for mode=books" }, { status: 400 });
      const books = await searchBooks(collection, q);
      return NextResponse.json({ books });
    }

    if (mode === "chapters") {
      if (!collection || !book)
        return NextResponse.json({ error: "collection and book are required for mode=chapters" }, { status: 400 });
      const matches = await searchChapterTitles(collection, book, q);
      const chapters = matches.map((c) => ({ ...c, bookNumber: book }));
      return NextResponse.json({ chapters });
    }

    // mode === "hadiths"
    if (!collection) {
      // No collection context (top-level Hadith page) — search hadith text
      // across every collection.
      const hadiths = await searchAllCollections(q, 3);
      return NextResponse.json({ hadiths });
    }

    let hadiths = await searchCollection(collection, q, { book, limit: chapter ? 50 : 20 });
    // The search API can scope to a collection or a book, but not down to
    // one chapter — so when we're on a single chapter's page, filter its
    // (book-scoped) results down to just this chapter client-side.
    if (chapter) hadiths = hadiths.filter((h) => h.chapter === chapter).slice(0, 20);
    return NextResponse.json({ hadiths });
  } catch {
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 502 });
  }
}
