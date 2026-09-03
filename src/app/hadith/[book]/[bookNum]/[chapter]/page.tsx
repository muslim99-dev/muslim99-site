import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronRight as BreadcrumbChevron } from "lucide-react";
import { getBook, getBooks, getBookEdition } from "@/lib/hadith.server";
import Navbar from "@/components/Navbar";
import HadithList from "@/components/hadith/HadithList";
import LanguageSwitcher from "@/components/hadith/LanguageSwitcher";

export async function generateStaticParams() {
  const books = await getBooks();
  const params: { book: string; bookNum: string; chapter: string }[] = [];
  for (const book of books) {
    if (book.prerender === false) continue; // rendered on demand instead — see BookSummary.prerender
    const edition = await getBookEdition(book.slug, book.defaultLanguage);
    for (const chapter of edition?.chapters ?? []) {
      params.push({ book: book.slug, bookNum: String(chapter.bookNumber), chapter: String(chapter.number) });
    }
  }
  return params;
}

export async function generateMetadata(props: PageProps<"/hadith/[book]/[bookNum]/[chapter]">): Promise<Metadata> {
  const { book: slug, chapter } = await props.params;
  const book = await getBook(slug);
  if (!book) return { title: "Chapter not found" };
  const edition = await getBookEdition(slug, book.defaultLanguage);
  const chapterNumber = Number(chapter);
  const chapterInfo = edition?.chapters.find((c) => c.number === chapterNumber);
  if (!book || !chapterInfo) return { title: "Chapter not found" };
  return {
    title: `${chapterInfo.name} — ${book.name}`,
    description: `Read hadiths from "${chapterInfo.name}" in ${book.name}, with narrator, grading, and reference for each hadith.`,
    alternates: { canonical: `/hadith/${book.slug}/${chapterInfo.bookNumber}/${chapterNumber}` },
  };
}

export default async function ChapterPage(props: PageProps<"/hadith/[book]/[bookNum]/[chapter]">) {
  const { book: slug, bookNum, chapter } = await props.params;
  const bookNumber = Number(bookNum);
  const chapterNumber = Number(chapter);
  if (!Number.isInteger(chapterNumber) || !Number.isInteger(bookNumber)) notFound();

  const book = await getBook(slug);
  if (!book) notFound();
  const edition = await getBookEdition(slug, book.defaultLanguage);
  if (!edition) notFound();

  const bookInfo = edition.books.find((b) => b.number === bookNumber);
  if (!bookInfo) notFound();

  const chapterInfo = edition.chapters.find((c) => c.number === chapterNumber && c.bookNumber === bookNumber);
  if (!chapterInfo) notFound();

  const initialHadiths = edition.hadiths.filter((h) => h.chapterNumber === chapterNumber);

  // Prev/next stay within the same book, matching the classical Kitab → Bab structure.
  const chaptersInBook = edition.chapters.filter((c) => c.bookNumber === bookNumber);
  const chapterIndex = chaptersInBook.findIndex((c) => c.number === chapterNumber);
  const prevChapter = chapterIndex > 0 ? chaptersInBook[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chaptersInBook.length - 1 ? chaptersInBook[chapterIndex + 1] : null;

  return (
    <>
      <Navbar
        backHref={`/hadith/${slug}/${bookNumber}`}
        backLabel="Back to chapters"
        extra={book.languages.length > 1 ? <LanguageSwitcher availableLanguages={book.languages} currentLanguage={book.defaultLanguage} /> : undefined}
      />
      <main className="min-h-screen pb-28 pt-24 sm:pt-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--faint)" }}>
            <Link href="/hadith" className="transition-colors hover:underline" style={{ color: "var(--muted)" }}>
              Hadith
            </Link>
            <BreadcrumbChevron size={13} />
            <Link href={`/hadith/${slug}`} className="truncate transition-colors hover:underline" style={{ color: "var(--muted)" }}>
              {book.name}
            </Link>
            <BreadcrumbChevron size={13} />
            <Link href={`/hadith/${slug}/${bookNumber}`} className="truncate transition-colors hover:underline" style={{ color: "var(--muted)" }}>
              {bookInfo.name}
            </Link>
            <BreadcrumbChevron size={13} />
            <span className="truncate font-medium" style={{ color: "var(--text)" }}>
              {chapterInfo.name}
            </span>
          </nav>

          <h1 className="mt-3 text-[22px] font-semibold" style={{ color: "var(--text)" }}>
            {chapterInfo.name}
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
            {bookInfo.name} · Chapter {chapterInfo.number} · {initialHadiths.length} hadith{initialHadiths.length === 1 ? "" : "s"}
          </p>

          <div className="mt-6">
            <HadithList
              bookSlug={slug}
              bookName={book.name}
              bookNumber={bookNumber}
              chapterNumber={chapterNumber}
              initialEdition={edition}
              initialLanguage={book.defaultLanguage}
              availableLanguages={book.languages}
            />
          </div>

          {/* Prev / next chapter (within the same book) */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {prevChapter ? (
              <Link href={`/hadith/${slug}/${bookNumber}/${prevChapter.number}`} className="card-surface flex flex-1 items-center gap-2 p-4 transition-transform hover:-translate-y-0.5">
                <ChevronLeft size={18} style={{ color: "var(--primary)" }} />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--faint)" }}>Previous</p>
                  <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{prevChapter.name}</p>
                </div>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {nextChapter ? (
              <Link href={`/hadith/${slug}/${bookNumber}/${nextChapter.number}`} className="card-surface flex flex-1 items-center justify-end gap-2 p-4 text-right transition-transform hover:-translate-y-0.5">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--faint)" }}>Next</p>
                  <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text)" }}>{nextChapter.name}</p>
                </div>
                <ChevronRight size={18} style={{ color: "var(--primary)" }} />
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
