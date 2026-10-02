import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getBook, getChapters } from "@/lib/hadith";
import HadithSearchBox from "@/components/HadithSearchBox";
import { Breadcrumbs, HeroStat, NumberBadge, PageHero } from "@/components/hadith/HadithUI";

export async function generateMetadata({ params }: { params: { book: string; bookNum: string } }) {
  const book = await getBook(params.book, Number(params.bookNum)).catch(() => undefined);
  return { title: book ? `${book.english || book.urdu || `Book ${book.number}`} — Hadith — Muslim99` : "Hadith — Muslim99" };
}

export default async function HadithBookPage({ params }: { params: { book: string; bookNum: string } }) {
  const bookNumber = Number(params.bookNum);
  if (!Number.isInteger(bookNumber)) notFound();

  const [collection, book] = await Promise.all([getCollection(params.book), getBook(params.book, bookNumber)]);
  if (!collection || !book) notFound();
  const chapters = await getChapters(params.book, bookNumber);
  const title = book.english || book.urdu || `Book ${book.number}`;

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Hadith", href: "/hadith" },
          { label: collection.name, href: `/hadith/${params.book}` },
          { label: `Book ${book.number}` }
        ]}
      />

      <div className="mt-4">
        <PageHero
          eyebrow={`${collection.name} · Book ${book.number}`}
          title={title}
          arabic={book.arabic || (book.english ? book.urdu : undefined)}
        >
          {book.english && book.urdu && book.arabic && (
            <p dir="rtl" className="mb-5 font-urdu text-base leading-[2.2] text-white/75">
              {book.urdu}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <HeroStat value={book.total_chapters} label="Chapters" />
            <HeroStat value={book.total_hadiths} label="Hadiths" />
          </div>
        </PageHero>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <HadithSearchBox
          mode="chapters"
          collectionSlug={params.book}
          bookNumber={bookNumber}
          placeholder="Find a chapter by title or number…"
        />
        <HadithSearchBox
          mode="hadiths"
          collectionSlug={params.book}
          bookNumber={bookNumber}
          placeholder="Search hadith text in this book…"
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-teal-dark">Chapters</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {chapters.map((c) => {
          const primary = c.english || c.urdu || c.arabic || `Chapter ${c.number}`;
          const urduLine = c.english ? c.urdu : "";
          const arabicLine = c.arabic && c.arabic !== primary ? c.arabic : "";
          return (
            <Link
              key={c.number}
              href={`/hadith/${params.book}/${bookNumber}/${c.number}`}
              className="group flex gap-4 rounded-card border border-border bg-white p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <NumberBadge n={c.number} />
              <div className="min-w-0 flex-1">
                <p
                  dir={c.english ? "ltr" : "rtl"}
                  className={`text-teal-dark group-hover:text-primary-deep transition-colors line-clamp-2 ${
                    c.english ? "text-[15px] font-medium leading-snug" : "text-right font-urdu text-base leading-[2.1]"
                  }`}
                >
                  {primary}
                </p>
                {urduLine && (
                  <p dir="rtl" className="mt-1.5 text-right font-urdu text-sm leading-[2.1] text-muted line-clamp-2">
                    {urduLine}
                  </p>
                )}
                {arabicLine && (
                  <p dir="rtl" className="mt-1 text-right font-arabic text-base leading-loose text-teal-dark/70 line-clamp-1">
                    {arabicLine}
                  </p>
                )}
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-primary-deep">
                  {c.total_hadiths} {c.total_hadiths === 1 ? "hadith" : "hadiths"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
