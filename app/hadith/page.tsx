import Link from "next/link";
import { getHadithBooks, editionLabel } from "@/lib/hadith";

export const metadata = { title: "Hadith — Muslim99" };

export default async function HadithPage() {
  let books;
  try {
    books = await getHadithBooks();
  } catch {
    books = null;
  }

  if (!books) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="rounded-card border border-border bg-white p-10">
          <p className="text-teal-dark font-medium">Couldn't load the hadith library.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-0 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Hadith</h1>
      <p className="mt-2 text-sm text-muted">
        {books.length} classical collections, each available in multiple languages. Every narration carries its
        reference and grading where the source provides one.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {books.map((book) => {
          const languages = Array.from(new Set(book.editions.map(editionLabel)));
          return (
            <Link
              key={book.slug}
              href={`/hadith/${book.slug}`}
              className="rounded-card border border-border bg-white p-5 transition-transform hover:-translate-y-0.5"
            >
              <p className="font-medium text-teal-dark">{book.name}</p>
              <p className="mt-1.5 text-xs text-muted">{languages.length} languages: {languages.join(", ")}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
