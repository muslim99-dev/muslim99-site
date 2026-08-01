import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronRight as BreadcrumbChevron } from "lucide-react";
import { getBook, getBooks, getBookEdition } from "@/lib/hadith.server";
import HadithHeader from "@/components/hadith/HadithHeader";
import HadithList from "@/components/hadith/HadithList";

export async function generateStaticParams() {
  const books = await getBooks();
  const params: { book: string; chapter: string }[] = [];
  for (const book of books) {
    const edition = await getBookEdition(book.slug, "eng");
    for (const chapter of edition?.chapters ?? []) {
      params.push({ book: book.slug, chapter: String(chapter.number) });
    }
  }
  return params;
}

export async function generateMetadata(props: PageProps<"/hadith/[book]/[chapter]">): Promise<Metadata> {
  const { book: slug, chapter } = await props.params;
  const book = await getBook(slug);
  const edition = await getBookEdition(slug, "eng");
  const chapterNumber = Number(chapter);
  const chapterInfo = edition?.chapters.find((c) => c.number === chapterNumber);
  if (!book || !chapterInfo) return { title: "Chapter not found" };
  return {
    title: `${chapterInfo.name} — ${book.name}`,
    description: `Read hadiths from "${chapterInfo.name}" in ${book.name}, with narrator, grading, and reference for each hadith.`,
    alternates: { canonical: `/hadith/${book.slug}/${chapterNumber}` },
  };
}

export default async function ChapterPage(props: PageProps<"/hadith/[book]/[chapter]">) {
  const { book: slug, chapter } = await props.params;
  const chapterNumber = Number(chapter);
  if (!Number.isInteger(chapterNumber)) notFound();

  const [book, books, edition] = await Promise.all([getBook(slug), getBooks(), getBookEdition(slug, "eng")]);
  if (!book || !edition) notFound();

  const chapterInfo = edition.chapters.find((c) => c.number === chapterNumber);
  if (!chapterInfo) notFound();

  const initialHadiths = edition.hadiths.filter((h) => h.chapterNumber === chapterNumber);
  const chapterIndex = edition.chapters.findIndex((c) => c.number === chapterNumber);
  const prevChapter = chapterIndex > 0 ? edition.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < edition.chapters.length - 1 ? edition.chapters[chapterIndex + 1] : null;

  return (
    <>
      <HadithHeader backHref={`/hadith/${slug}`} backLabel="Back to chapters" availableLanguages={book.languages} />
      <main className="min-h-screen pb-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
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
              {chapterInfo.name}
            </span>
          </nav>

          <h1 className="mt-3 text-[22px] font-semibold" style={{ color: "var(--text)" }}>
            {chapterInfo.name}
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
            Chapter {chapterInfo.number} of {book.name} · {initialHadiths.length} hadith{initialHadiths.length === 1 ? "" : "s"}
          </p>

          <div className="mt-6">
            <HadithList
              bookSlug={slug}
              bookName={book.name}
              chapterNumber={chapterNumber}
              initialChapterName={chapterInfo.name}
              initialHadiths={initialHadiths}
              initialDirection="ltr"
            />
          </div>

          {/* Prev / next chapter */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {prevChapter ? (
              <Link href={`/hadith/${slug}/${prevChapter.number}`} className="card-surface flex flex-1 items-center gap-2 p-4 transition-transform hover:-translate-y-0.5">
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
              <Link href={`/hadith/${slug}/${nextChapter.number}`} className="card-surface flex flex-1 items-center justify-end gap-2 p-4 text-right transition-transform hover:-translate-y-0.5">
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
