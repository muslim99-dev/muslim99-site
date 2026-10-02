import Link from "next/link";
import { getDuaCategories, duaSources, totalDuas, type DuaCategory } from "@/lib/duas";
import { HeroStat, PageHero } from "@/components/hadith/HadithUI";
import DuaSearchBox from "@/components/duas/DuaSearchBox";

export const metadata = {
  title: "Duas & Azkar — Authentic Supplications with References | Muslim99",
  alternates: { canonical: "/duas" },
  description: `${totalDuas} authentic duas from the Qur'an and Hisn al-Muslim, with Arabic text, translations and references.`
};

function CategoryCard({ c }: { c: DuaCategory }) {
  return (
    <Link
      href={`/duas/${c.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-aqua transition-colors group-hover:bg-primary/60"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-teal-dark group-hover:text-primary-deep transition-colors">{c.title}</p>
          {c.titleArabic && (
            <p dir="rtl" lang="ar" className="mt-2 text-right font-arabic text-lg leading-loose text-muted">
              {c.titleArabic}
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
      <p className="mt-auto pt-4 text-xs text-muted">
        <span className="font-semibold text-teal-dark tabular-nums">{c.total}</span> duas ·{" "}
        <span className="font-semibold text-teal-dark tabular-nums">{c.chapters.length}</span>{" "}
        {c.source === "quran" ? "themes" : "chapters"}
      </p>
      <p className="mt-2 text-[11px] text-primary-deep line-clamp-1">
        {c.chapters
          .slice(0, 3)
          .map((ch) => ch.title)
          .join(" · ")}
        {c.chapters.length > 3 && " …"}
      </p>
    </Link>
  );
}

export default function DuasPage() {
  const categories = getDuaCategories();
  const quran = categories.filter((c) => c.source === "quran");
  const hisn = categories.filter((c) => c.source === "hisn");
  const chapters = categories.reduce((s, c) => s + c.chapters.length, 0);

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8 sm:py-10">
      <PageHero
        eyebrow="Supplications & Remembrance"
        title="Duas"
        subtitle="Authentic supplications from the Qur'an and the Sunnah, with the Arabic text, translations in several languages, and the exact source of every dua."
        arabic="أدعية وأذكار"
      >
        <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
          <HeroStat value={totalDuas} label="Duas" />
          <HeroStat value={categories.length} label="Categories" />
          <HeroStat value={chapters} label="Topics" />
        </div>
      </PageHero>

      <div className="mt-6">
        <DuaSearchBox />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-teal-dark">From the Qur&apos;an</h2>
        <p className="text-sm text-muted">Supplications of the Prophets and the believers, with published Urdu and English translations</p>
        {quran.map((c) => (
          <div key={c.slug} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {c.chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/duas/${c.slug}#${ch.id}`}
                className="group relative overflow-hidden rounded-card border border-gold/30 bg-gradient-to-br from-white to-[#FBF7EA] p-4 transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-card"
              >
                <p className="text-sm font-semibold leading-snug text-teal-dark group-hover:text-primary-deep">{ch.title}</p>
                <p className="mt-2 text-xs text-muted">
                  <span className="font-semibold tabular-nums text-gold">{ch.duas.length}</span> {ch.duas.length === 1 ? "dua" : "duas"}
                </p>
              </Link>
            ))}
          </div>
        ))}
        <Link href="/duas/quran" className="mt-4 inline-block text-sm font-medium text-primary-deep hover:underline">
          Read all {quran.reduce((s, c) => s + c.total, 0)} Qur&apos;anic duas →
        </Link>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-dark">Hisn al-Muslim</h2>
            <p className="text-sm text-muted">Fortress of the Muslim — daily duas from the authentic Sunnah, with hadith references</p>
          </div>
          <p dir="rtl" lang="ar" className="hidden sm:block font-arabic text-lg text-gold">
            حصن المسلم
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hisn.map((c) => (
            <CategoryCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        Sources:{" "}
        {duaSources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            {s.name} (via{" "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary-deep hover:underline">
              {s.via}
            </a>
            )
          </span>
        ))}
        . Hisn al-Muslim translations: English, Persian and Russian from the source; Urdu is an AI-assisted translation
        from the Arabic made for Muslim99 (Qur&apos;an passages within it use Fateh Muhammad Jalandhry), so rely on the
        Arabic text. Qur&apos;anic duas: Saheeh International, Pickthall, Fateh Muhammad Jalandhry and Muhammad Junagarhi.
      </p>
    </div>
  );
}
