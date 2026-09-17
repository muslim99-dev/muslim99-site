import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getBook, getChapter } from "@/lib/hadith";
import HadithChapterView from "@/components/HadithChapterView";
import HadithSearchBox from "@/components/HadithSearchBox";

export default async function HadithChapterPage({
  params
}: {
  params: { book: string; bookNum: string; chapter: string };
}) {
  const bookNumber = Number(params.bookNum);
  const chapterNumber = Number(params.chapter);
  if (!Number.isInteger(bookNumber) || !Number.isInteger(chapterNumber)) notFound();

  const [collection, book] = await Promise.all([getCollection(params.book), getBook(params.book, bookNumber)]);
  if (!collection || !book) notFound();

  let chapter;
  try {
    chapter = await getChapter(params.book, bookNumber, chapterNumber);
  } catch {
    chapter = null;
  }

  if (!chapter) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="rounded-card border border-border bg-white p-10">
          <p className="text-teal-dark font-medium">Couldn't load this chapter.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Link href={`/hadith/${params.book}/${bookNumber}`} className="text-xs text-primary-deep">
        ← {book.english || `Book ${bookNumber}`}
      </Link>
      <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-teal-dark">
        {chapter.number}. {chapter.english || `Chapter ${chapter.number}`}
      </h1>
      {chapter.urdu && (
        <p dir="rtl" className="mt-1 text-sm text-muted font-urdu">
          {chapter.urdu}
        </p>
      )}
      <p className="mt-1 text-xs text-muted">{collection.name} · {chapter.total_hadiths} hadith</p>

      <div className="mt-4">
        <HadithSearchBox
          mode="hadiths"
          collectionSlug={params.book}
          bookNumber={bookNumber}
          chapterNumber={chapterNumber}
          placeholder="Search hadith text in this chapter…"
        />
      </div>

      <div className="mt-6">
        <HadithChapterView chapter={chapter} />
      </div>
    </div>
  );
}
