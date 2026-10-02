import Link from "next/link";
import { getCollections, type Collection } from "@/lib/hadith";
import HadithSearchBox from "@/components/HadithSearchBox";
import { ErrorCard, HeroStat, LanguageTags, PageHero } from "@/components/hadith/HadithUI";

export const metadata = { title: "Hadith — Muslim99" };

// The six canonical collections, in their traditional order.
const KUTUB_AL_SITTAH = [
  "sahih-bukhari",
  "sahih-muslim",
  "sunnan-abu-dawood",
  "jam-e-tirmazi",
  "sunnan-nisai",
  "sunnan-ibn-e-maja"
];

function CollectionCard({ c, featured }: { c: Collection; featured?: boolean }) {
  return (
    <Link
      href={`/hadith/${c.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
    >
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1 ${featured ? "bg-gradient-to-r from-gold to-primary" : "bg-aqua group-hover:bg-primary/60"} transition-colors`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-teal-dark group-hover:text-primary-deep transition-colors">{c.name}</p>
          {c.name_urdu && (
            <p dir="rtl" className="mt-2 text-right font-urdu text-base leading-[2] text-muted">
              {c.name_urdu}
            </p>
          )}
        </div>
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-aqua text-primary-deep transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>
            <span className="font-semibold text-teal-dark tabular-nums">{c.total_hadiths.toLocaleString()}</span> hadiths
          </span>
          <span className="h-3 w-px bg-border" />
          <span>
            <span className="font-semibold text-teal-dark tabular-nums">{c.total_books}</span> books
          </span>
        </div>
        <div className="mt-3">
          <LanguageTags languages={c.languages} />
        </div>
      </div>
    </Link>
  );
}

export default async function HadithPage() {
  let collections: Collection[] | null;
  try {
    collections = await getCollections();
  } catch {
    collections = null;
  }

  if (!collections) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <ErrorCard title="Couldn't load the hadith library." detail="The hadith index is missing on the server." />
      </div>
    );
  }

  const totalHadiths = collections.reduce((sum, c) => sum + c.total_hadiths, 0);
  const totalBooks = collections.reduce((sum, c) => sum + c.total_books, 0);
  const featured = KUTUB_AL_SITTAH.map((s) => collections!.find((c) => c.slug === s)).filter(
    (c): c is Collection => !!c
  );
  const others = collections.filter((c) => !KUTUB_AL_SITTAH.includes(c.slug));

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8 sm:py-10">
      <PageHero
        eyebrow="Sunnah of the Prophet ﷺ"
        title="Hadith Library"
        subtitle="Classical hadith collections with the original Arabic, Urdu translations from multiple scholars, English where available, and the grading of each narration."
        arabic="الحديث النبوي الشريف"
      >
        <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
          <HeroStat value={collections.length} label="Collections" />
          <HeroStat value={totalBooks} label="Books" />
          <HeroStat value={totalHadiths} label="Hadiths" />
        </div>
      </PageHero>

      <div className="mt-6">
        <HadithSearchBox mode="hadiths" placeholder={`Search hadith text across all ${collections.length} collections — Arabic, Urdu or English…`} />
      </div>

      {featured.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-teal-dark">Kutub al-Sittah</h2>
              <p className="text-sm text-muted">The six canonical collections of Sunni hadith</p>
            </div>
            <p dir="rtl" className="hidden sm:block font-urdu text-lg text-gold">
              الكتب الستة
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CollectionCard key={c.slug} c={c} featured />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-teal-dark">More Collections</h2>
          <p className="text-sm text-muted">Musnads, Sunans, compilations and specialised works</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <CollectionCard key={c.slug} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
