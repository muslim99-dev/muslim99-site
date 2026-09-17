import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getBook, getChapterNumbers } from "@/lib/hadith";
import HadithSearchBox from "@/components/HadithSearchBox";

export default async function HadithBookPage({ params }: { params: { book: string; bookNum: string } }) {
  const bookNumber = Number(params.bookNum);
  if (!Number.isInteger(bookNumber)) notFound();

  const collection = await getCollection(params.book);
  const book = await getBook(params.book, bookNumber);
  if (!collection || !book) notFound();

  let chapterNumbers: number[] | null;
  try {
    chapterNumbers = await getChapterNumbers(params.book, bookNumber);
  } catch {
    chapterNumbers = null;
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Link href={`/hadith/${params.book}`} className="text-xs text-primary-deep">
        ← {collection.name}
      </Link>
      <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-teal-dark">
        {book.number}. {book.english || `Book ${book.number}`}
      </h1>
      {book.urdu && (
        <p dir="rtl" className="mt-1 text-sm text-muted font-urdu">
          {book.urdu}
        </p>
      )}
      <p className="mt-1 text-xs text-muted">{book.total_hadiths} hadiths · {book.total_chapters} chapters</p>

      <div className="mt-4">
        <HadithSearchBox
          mode="chapters"
          collectionSlug={params.book}
          bookNumber={bookNumber}
          placeholder="Search chapters by name or number…"
        />
      </div>

      {!chapterNumbers ? (
        <div className="mt-8 rounded-card border border-border bg-white p-8 text-center">
          <p className="text-teal-dark font-medium">Couldn't load this book's chapters.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
          {chapterNumbers.map((n) => (
            <Link
              key={n}
              href={`/hadith/${params.book}/${bookNumber}/${n}`}
              className="rounded-card border border-border bg-white px-4 py-3 text-center text-sm text-teal-dark transition-transform hover:-translate-y-0.5"
            >
              Chapter {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
