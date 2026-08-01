import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook, getBooks, getBookEdition } from "@/lib/hadith.server";
import HadithHeader from "@/components/hadith/HadithHeader";
import ChapterList from "@/components/hadith/ChapterList";
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
    title: `${book.name} — Chapters and Hadiths`,
    description: `Browse ${book.name} by ${book.author}, ${book.totalHadiths.toLocaleString()} hadiths across ${book.languages.length} languages, with narrator, grading, and reference for each hadith.`,
    alternates: { canonical: `/hadith/${book.slug}` },
  };
}

export default async function BookPage(props: PageProps<"/hadith/[book]">) {
  const { book: slug } = await props.params;
  const book = await getBook(slug);
  if (!book) notFound();

  const englishEdition = await getBookEdition(slug, "eng");
  const initialChapters = englishEdition?.chapters ?? [];

  return (
    <>
      <HadithHeader backHref="/hadith" backLabel="All books" availableLanguages={book.languages} />
      <main className="min-h-screen pb-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          {/* Book hero */}
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
                <span className="inline-flex items-center gap-1.5">{initialChapters.length} chapters</span>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="mt-8">
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>
              Chapters
            </h2>
            <ChapterList bookSlug={book.slug} initialChapters={initialChapters} initialDirection="ltr" />
          </div>
        </div>
      </main>
    </>
  );
}
