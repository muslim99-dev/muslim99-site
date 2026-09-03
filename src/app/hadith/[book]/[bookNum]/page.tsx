import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight as BreadcrumbChevron } from "lucide-react";
import { getBook, getBooks, getBookEdition } from "@/lib/hadith.server";
import Navbar from "@/components/Navbar";
import ChapterList from "@/components/hadith/ChapterList";
import LanguageSwitcher from "@/components/hadith/LanguageSwitcher";

export async function generateStaticParams() {
  const books = await getBooks();
  const params: { book: string; bookNum: string }[] = [];
  for (const book of books) {
    if (book.prerender === false) continue; // rendered on demand instead — see BookSummary.prerender
    const edition = await getBookEdition(book.slug, book.defaultLanguage);
    for (const b of edition?.books ?? []) {
      params.push({ book: book.slug, bookNum: String(b.number) });
    }
  }
  return params;
}

export async function generateMetadata(props: PageProps<"/hadith/[book]/[bookNum]">): Promise<Metadata> {
  const { book: slug, bookNum } = await props.params;
  const book = await getBook(slug);
  if (!book) return { title: "Book not found" };
  const edition = await getBookEdition(slug, book.defaultLanguage);
  const bookNumber = Number(bookNum);
  const bookInfo = edition?.books.find((b) => b.number === bookNumber);
  if (!bookInfo) return { title: "Book not found" };
  return {
    title: `${bookInfo.name} — ${book.name}`,
    description: `Browse the chapters of "${bookInfo.name}" in ${book.name}, ${bookInfo.totalHadiths} hadiths across ${bookInfo.totalChapters} chapters.`,
    alternates: { canonical: `/hadith/${book.slug}/${bookNumber}` },
  };
}

export default async function BookNumPage(props: PageProps<"/hadith/[book]/[bookNum]">) {
  const { book: slug, bookNum } = await props.params;
  const bookNumber = Number(bookNum);
  if (!Number.isInteger(bookNumber)) notFound();

  const book = await getBook(slug);
  if (!book) notFound();
  const edition = await getBookEdition(slug, book.defaultLanguage);
  if (!edition) notFound();

  const bookInfo = edition.books.find((b) => b.number === bookNumber);
  if (!bookInfo) notFound();

  return (
    <>
      <Navbar
        backHref={`/hadith/${slug}`}
        backLabel="Back to books"
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
            <span className="truncate font-medium" style={{ color: "var(--text)" }}>
              {bookInfo.name}
            </span>
          </nav>

          <div className="mt-4">
            <ChapterList
              bookSlug={slug}
              bookNumber={bookNumber}
              initialEdition={edition}
              initialLanguage={book.defaultLanguage}
              availableLanguages={book.languages}
            />
          </div>
        </div>
      </main>
    </>
  );
}
