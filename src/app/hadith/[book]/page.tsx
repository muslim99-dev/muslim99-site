import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook, getBooks, getBookEdition } from "@/lib/hadith.server";
import Navbar from "@/components/Navbar";
import BookList from "@/components/hadith/BookList";
import LanguageSwitcher from "@/components/hadith/LanguageSwitcher";
import { BookOpen, User, Layers } from "lucide-react";

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((b) => ({ book: b.slug }));
}

export async function generateMetadata(props: PageProps<"/hadith/[book]">): Promise<Metadata> {
  const { book: slug } = await props.params;
  const book = await getBook(slug);
  if (!book) return { title: "Book not found" };
  return {
    title: `${book.name} — Books, Chapters and Hadiths`,
    description: `Browse ${book.name} by ${book.author}, ${book.totalHadiths.toLocaleString()} hadiths across ${book.languages.length} languages, with narrator, grading, and reference for each hadith.`,
    alternates: { canonical: `/hadith/${book.slug}` },
  };
}

export default async function BookPage(props: PageProps<"/hadith/[book]">) {
  const { book: slug } = await props.params;
  const book = await getBook(slug);
  if (!book) notFound();

  const fullEdition = await getBookEdition(slug, book.defaultLanguage);
  const books = fullEdition?.books ?? [];
  // This page only ever lists Kitab-level books (BookList reads `.books`
  // and nothing else) — but `fullEdition` is the entire per-language JSON,
  // full hadith text and all, which can run 30+ MB for large collections
  // (Bukhari, Muslim, Fath al-Rabbani, Sunan al-Kubra al-Bayhaqi). Passing
  // that whole object into the client component would bake all of it into
  // this static page's payload, blowing past Vercel's ISR fallback size
  // limit. Strip it down to just what the index actually renders.
  const defaultEdition = fullEdition
    ? { language: fullEdition.language, direction: fullEdition.direction, books: fullEdition.books, chapters: [], hadiths: [] }
    : null;

  return (
    <>
      <Navbar
        backHref="/hadith"
        backLabel="All books"
        extra={book.languages.length > 1 ? <LanguageSwitcher availableLanguages={book.languages} currentLanguage={book.defaultLanguage} /> : undefined}
      />
      <main className="min-h-screen pb-24 pt-24 sm:pt-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          {/* Collection hero */}
          <div className="relative mt-6 overflow-hidden rounded-[var(--r-hero)] p-8 text-center sm:p-10" style={{ background: "var(--grad-hero)" }}>
            <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.16]" />
            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.16)" }}>
                <BookOpen size={26} color="white" />
              </div>
              <h1 className="mt-4 text-[24px] font-semibold text-white">{book.name}</h1>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[13.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                <User size={13} /> {book.author} <span style={{ color: "rgba(255,255,255,0.6)" }}>· {book.authorYear}</span>
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]" style={{ color: "rgba(255,255,255,0.9)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <Layers size={14} /> {book.totalHadiths.toLocaleString()} hadiths
                </span>
                <span className="inline-flex items-center gap-1.5">{books.length} books</span>
              </div>
            </div>
          </div>

          {/* Books */}
          <div className="mt-8">
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
              Books
            </h2>
            {defaultEdition && (
              <BookList bookSlug={book.slug} initialEdition={defaultEdition} initialLanguage={book.defaultLanguage} availableLanguages={book.languages} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
