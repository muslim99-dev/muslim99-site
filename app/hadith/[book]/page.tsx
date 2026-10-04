import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getBooks } from "@/lib/hadith";
import HadithSearchBox from "@/components/HadithSearchBox";
import ContinueReading from "@/components/hadith/ContinueReading";
import { Breadcrumbs, HeroStat, LanguageTags, NumberBadge, PageHero } from "@/components/hadith/HadithUI";

export async function generateMetadata({ params }: { params: { book: string } }) {
  const collection = await getCollection(params.book).catch(() => undefined);
  if (!collection) return { title: "Hadith — Muslim99" };
  return {
    title: `${collection.name} — Read Online in Arabic, Urdu${collection.languages.includes("English") ? " & English" : ""} | Muslim99`,
    description: `Read ${collection.name} (${collection.name_urdu}) online: ${collection.total_hadiths.toLocaleString()} hadiths in ${collection.total_books} books with ${collection.languages.join(", ")} text and the grading of each hadith.`,
    alternates: { canonical: `/hadith/${params.book}` }
  };
}

export default async function HadithCollectionPage({ params }: { params: { book: string } }) {
  const collection = await getCollection(params.book);
  if (!collection) notFound();
  const books = await getBooks(params.book);
  const totalChapters = books.reduce((s, b) => s + b.total_chapters, 0);

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Hadith", href: "/hadith" }, { label: collection.name }]} />

      <div className="mt-4">
        <PageHero
          eyebrow={collection.author ? `Collection · ${collection.author}` : "Collection"}
          title={collection.name}
          arabic={collection.name_urdu}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
              <HeroStat value={collection.total_books} label="Books" />
              <HeroStat value={totalChapters} label="Chapters" />
              <HeroStat value={collection.total_hadiths} label="Hadiths" />
            </div>
            <LanguageTags languages={collection.languages} tone="dark" />
          </div>
        </PageHero>
      </div>

      {(collection.intro || collection.translation_note) && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          {collection.intro && (
            <div className="rounded-card border border-border bg-white p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">About this book</p>
              {collection.author && <p className="mt-1 text-sm font-medium text-teal-dark">Compiled by {collection.author}</p>}
              <p className="mt-3 text-[15px] leading-relaxed text-teal-dark/85">{collection.intro}</p>
              {collection.intro_urdu && (
                <p dir="rtl" lang="ur" className="mt-4 border-t border-border pt-4 text-right font-urdu text-base leading-[2.2] text-teal-dark/85">
                  {collection.intro_urdu}
                </p>
              )}
            </div>
          )}
          {collection.translation_note && (
            <aside className="h-fit rounded-card border border-gold/40 bg-[#FBF7EA] p-5 text-sm leading-relaxed text-teal-dark/85">
              <p className="font-semibold text-teal-dark">About the translations</p>
              <p className="mt-2">{collection.translation_note}</p>
              {collection.source && <p className="mt-3 text-xs text-muted">Source: {collection.source}</p>}
            </aside>
          )}
        </section>
      )}

      <div className="mt-6 empty:hidden">
        <ContinueReading slug={params.book} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <HadithSearchBox mode="books" collectionSlug={params.book} placeholder={`Find a book in ${collection.name}…`} />
        <HadithSearchBox mode="hadiths" collectionSlug={params.book} placeholder={`Search hadith text in ${collection.name}…`} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-teal-dark">Books</h2>
      <div className="mt-4 overflow-hidden rounded-card border border-border bg-white">
        <ul className="divide-y divide-border">
          {books.map((b) => (
            <li key={b.number}>
              <Link
                href={`/hadith/${params.book}/${b.number}`}
                className="group flex items-center gap-4 px-4 py-4 sm:px-6 transition-colors hover:bg-aqua/40"
              >
                <NumberBadge n={b.number} />
                <div className="min-w-0 flex-1 grid gap-1 md:grid-cols-2 md:items-center md:gap-6">
                  <div className="min-w-0">
                    <p className="font-medium text-teal-dark group-hover:text-primary-deep transition-colors line-clamp-2">
                      {b.english || b.urdu || `Book ${b.number}`}
                    </p>
                    {b.english && b.urdu && (
                      <p dir="rtl" className="mt-1 text-right font-urdu text-sm leading-[2] text-muted line-clamp-1 md:hidden">
                        {b.urdu}
                      </p>
                    )}
                  </div>
                  {(b.arabic || (b.english && b.urdu)) && (
                    <p dir="rtl" className="hidden md:block text-right font-arabic text-lg leading-loose text-teal-dark/80 line-clamp-1">
                      {b.arabic || b.urdu}
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex shrink-0 flex-col items-end text-right">
                  <span className="text-sm font-semibold tabular-nums text-teal-dark">{b.total_hadiths.toLocaleString()}</span>
                  <span className="text-[11px] text-muted">
                    hadiths · {b.total_chapters} ch.
                  </span>
                </div>
                <span aria-hidden className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-deep">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
