import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getBook, getChapter, getAdjacentChapters } from "@/lib/hadith";
import HadithChapterView from "@/components/HadithChapterView";
import HadithSearchBox from "@/components/HadithSearchBox";
import { Breadcrumbs, ErrorCard, IslamicPattern } from "@/components/hadith/HadithUI";

type Params = { book: string; bookNum: string; chapter: string };

export async function generateMetadata({ params }: { params: Params }) {
  const collection = await getCollection(params.book).catch(() => undefined);
  const chapter = await getChapter(params.book, Number(params.bookNum), Number(params.chapter)).catch(() => undefined);
  const name = (chapter?.english || chapter?.urdu || `Chapter ${params.chapter}`).replace(/\s+/g, " ").replace(/[\s.]+$/, "");
  const first = chapter?.hadiths[0];
  const snippet = (first?.english_translation || first?.urdu_translation || "").replace(/\s+/g, " ").slice(0, 120);
  return {
    title: `${name} — ${collection?.name ?? "Hadith"} | Muslim99`,
    description: `${collection?.name ?? "Hadith"}, Book ${params.bookNum}, Chapter ${params.chapter}: ${name}.${snippet ? ` ${snippet}…` : ""}`,
    alternates: { canonical: `/hadith/${params.book}/${params.bookNum}/${params.chapter}` }
  };
}

export default async function HadithChapterPage({ params }: { params: Params }) {
  const bookNumber = Number(params.bookNum);
  const chapterNumber = Number(params.chapter);
  if (!Number.isInteger(bookNumber) || !Number.isInteger(chapterNumber)) notFound();

  const [collection, book] = await Promise.all([getCollection(params.book), getBook(params.book, bookNumber)]);
  if (!collection || !book) notFound();

  let chapter;
  try {
    chapter = await getChapter(params.book, bookNumber, chapterNumber);
  } catch {
    notFound();
  }
  const { prev, next } = await getAdjacentChapters(params.book, bookNumber, chapterNumber);
  const bookTitle = book.english || book.urdu || `Book ${bookNumber}`;
  const chapterLink = (c: { book: number; number: number }) => `/hadith/${params.book}/${c.book}/${c.number}`;

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Hadith", href: "/hadith" },
          { label: collection.name, href: `/hadith/${params.book}` },
          { label: `Book ${bookNumber}`, href: `/hadith/${params.book}/${bookNumber}` },
          { label: `Chapter ${chapter.number}` }
        ]}
      />

      <header className="relative mt-4 overflow-hidden rounded-card border border-border bg-white px-6 py-7 sm:px-8 text-center shadow-card">
        <IslamicPattern className="absolute inset-0 text-primary/[0.06]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            {collection.name} · Book {bookNumber} · Chapter {chapter.number}
          </p>
          <p className="mt-1 text-xs text-muted line-clamp-1">{bookTitle}</p>
          {chapter.arabic && (
            <p dir="rtl" className="mt-4 font-arabic text-2xl leading-loose text-teal-dark">
              {chapter.arabic}
            </p>
          )}
          {chapter.english && (
            <h1 className="mt-2 text-lg sm:text-xl font-semibold leading-snug text-teal-dark">{chapter.english}</h1>
          )}
          {chapter.urdu && (
            <p dir="rtl" className={`mt-2 font-urdu leading-[2.2] ${chapter.english ? "text-base text-muted" : "text-lg text-teal-dark"}`}>
              {chapter.urdu}
            </p>
          )}
          <div className="mx-auto mt-4 flex w-24 items-center gap-2" aria-hidden>
            <span className="h-px flex-1 bg-gold/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gold/50" />
          </div>
          <p className="mt-3 text-xs text-muted">
            {chapter.total_hadiths} {chapter.total_hadiths === 1 ? "hadith" : "hadiths"} in this chapter
          </p>
        </div>
      </header>

      {chapter.total_hadiths > 3 && (
        <div className="mt-6">
          <HadithSearchBox
            mode="hadiths"
            collectionSlug={params.book}
            bookNumber={bookNumber}
            chapterNumber={chapterNumber}
            placeholder="Search within this chapter…"
          />
        </div>
      )}

      <div className="mt-6">
        {chapter.hadiths.length === 0 ? (
          <ErrorCard title="No hadiths in this chapter." detail="The source dataset has no entries here." />
        ) : (
          <HadithChapterView chapter={chapter} collectionName={collection.name} />
        )}
      </div>

      <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Chapter navigation">
        {prev ? (
          <Link
            href={chapterLink(prev)}
            className="group rounded-card border border-border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">← Previous chapter</p>
            <p className="mt-1 text-sm font-medium text-teal-dark group-hover:text-primary-deep line-clamp-1">
              {prev.book !== bookNumber && `Book ${prev.book} · `}
              {prev.english || prev.urdu || `Chapter ${prev.number}`}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={chapterLink(next)}
            className="group rounded-card border border-border bg-white p-4 text-right transition-all hover:border-primary/40 hover:shadow-card"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Next chapter →</p>
            <p className="mt-1 text-sm font-medium text-teal-dark group-hover:text-primary-deep line-clamp-1">
              {next.book !== bookNumber && `Book ${next.book} · `}
              {next.english || next.urdu || `Chapter ${next.number}`}
            </p>
          </Link>
        )}
      </nav>
    </div>
  );
}
