import Link from "next/link";
import { notFound } from "next/navigation";
import { getHadithBook, getHadithEdition, getSections } from "@/lib/hadith";
import HadithEditionSwitcher from "@/components/HadithEditionSwitcher";

export default async function HadithBookPage({
  params,
  searchParams
}: {
  params: { book: string };
  searchParams: { edition?: string };
}) {
  const book = await getHadithBook(params.book);
  if (!book) notFound();

  const preferredOrder = ["English", "Arabic"];
  const defaultEdition =
    book.editions.find((e) => e.name === searchParams.edition) ??
    preferredOrder.map((lang) => book.editions.find((e) => e.language === lang)).find(Boolean) ??
    book.editions[0];

  let edition;
  try {
    edition = await getHadithEdition(defaultEdition.name);
  } catch {
    edition = null;
  }

  const sections = edition ? getSections(edition) : [];

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-0 py-8">
      <Link href="/hadith" className="text-xs text-primary-deep">
        ← All Books
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-teal-dark">{book.name}</h1>
        <HadithEditionSwitcher editions={book.editions} current={defaultEdition.name} />
      </div>

      {edition && defaultEdition.language !== "English" && (
        <p className="mt-2 text-[11px] text-muted">
          Chapter titles are shown in English — the source only publishes them in English for every language.
          Hadith text below is in {defaultEdition.language}.
        </p>
      )}

      {!edition ? (
        <div className="mt-8 rounded-card border border-border bg-white p-8 text-center">
          <p className="text-teal-dark font-medium">Couldn't load this collection.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {sections.map((s) => (
            <Link
              key={s.number}
              href={`/hadith/${book.slug}/${s.number}?edition=${defaultEdition.name}`}
              className="flex items-center justify-between rounded-card border border-border bg-white px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-sm text-teal-dark">
                {s.number}. {s.title}
              </span>
              <span className="text-xs text-muted shrink-0">{s.count} hadith</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
