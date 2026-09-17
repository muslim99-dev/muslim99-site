import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getBooks } from "@/lib/hadith";
import HadithSearchBox from "@/components/HadithSearchBox";

export default async function HadithCollectionPage({ params }: { params: { book: string } }) {
  const collection = await getCollection(params.book);
  if (!collection) notFound();

  let books;
  try {
    books = await getBooks(params.book);
  } catch {
    books = null;
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Link href="/hadith" className="text-xs text-primary-deep">
        ← All Collections
      </Link>
      <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-teal-dark">{collection.name}</h1>
      {collection.name_urdu && (
        <p dir="rtl" className="mt-1 text-sm text-muted font-urdu">
          {collection.name_urdu}
        </p>
      )}
      <p className="mt-1 text-xs text-muted">
        {collection.total_hadiths.toLocaleString()} hadiths · {collection.total_books} books
      </p>

      <div className="mt-4">
        <HadithSearchBox mode="books" collectionSlug={params.book} placeholder={`Search books in ${collection.name}…`} />
      </div>

      {!books ? (
        <div className="mt-8 rounded-card border border-border bg-white p-8 text-center">
          <p className="text-teal-dark font-medium">Couldn't load this collection's books.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {books.map((b) => (
            <Link
              key={b.number}
              href={`/hadith/${params.book}/${b.number}`}
              className="flex items-center justify-between rounded-card border border-border bg-white px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-sm text-teal-dark">
                {b.number}. {b.english || b.urdu || `Book ${b.number}`}
              </span>
              <span className="text-xs text-muted shrink-0">{b.total_hadiths} hadith</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
