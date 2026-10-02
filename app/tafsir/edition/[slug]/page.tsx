import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurahList } from "@/lib/quranApi";
import { TAFSIRS, getEditionCoverage, getTafsir } from "@/lib/tafsir";
import { Breadcrumbs, HeroStat, PageHero } from "@/components/hadith/HadithUI";
import SurahGrid from "@/components/tafsir/SurahGrid";
import TafsirSearch from "@/components/tafsir/TafsirSearch";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const t = getTafsir(params.slug);
  return { title: t ? `${t.name}${t.author ? ` — ${t.author}` : ""} — Tafsir — Muslim99` : "Tafsir — Muslim99" };
}

export default async function TafsirEditionPage({ params }: { params: { slug: string } }) {
  const edition = getTafsir(params.slug);
  if (!edition) notFound();

  const [surahs, coverage] = await Promise.all([getSurahList().catch(() => null), getEditionCoverage(edition.slug).catch(() => null)]);
  const coverageMap = coverage ? Object.fromEntries(coverage.map((c) => [c.number, c.withTafsir])) : undefined;
  const ayahsCovered = coverage?.every((c) => typeof c.withTafsir === "number")
    ? coverage.reduce((s, c) => s + (c.withTafsir ?? 0), 0)
    : null;
  const sameWork = TAFSIRS.filter((t) => t.slug !== edition.slug && t.name.split(" (")[0] === edition.name.split(" (")[0]);

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Tafsir", href: "/tafsir" }, { label: edition.name }]} />

      <div className="mt-4">
        <PageHero eyebrow={`${edition.type} · ${edition.language}`} title={edition.name} subtitle={edition.author || undefined}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className={`grid gap-3 sm:max-w-md ${ayahsCovered !== null ? "grid-cols-2" : "grid-cols-1 max-w-[12rem]"}`}>
              <HeroStat value={coverage?.length ?? edition.surahs} label="Surahs" />
              {ayahsCovered !== null && <HeroStat value={ayahsCovered} label="Ayahs with commentary" />}
            </div>
            <Link
              href={`/tafsir/${coverage?.[0]?.number ?? 1}?edition=${edition.slug}`}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-medium text-teal-dark shadow-sm transition-colors hover:bg-aqua sm:self-auto"
            >
              Start reading →
            </Link>
          </div>
        </PageHero>
      </div>

      <div className="mt-6">
        <TafsirSearch edition={edition.slug} editionName={edition.name} dir={edition.dir} />
      </div>

      {sameWork.length > 0 && (
        <div className="mt-6 rounded-card border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Also available in</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sameWork.map((t) => (
              <Link key={t.slug} href={`/tafsir/edition/${t.slug}`} className="rounded-full bg-aqua/60 px-3 py-1 text-xs font-medium text-primary-deep hover:bg-aqua">
                {t.language}
                {t.name !== edition.name && ` · ${t.name}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-teal-dark">Surahs</h2>
        <p className="text-sm text-muted">
          {coverage && coverage.length < 114 ? `This edition covers ${coverage.length} of the 114 surahs.` : "Choose a surah to read its commentary."}
        </p>
        <div className="mt-4">
          {surahs ? (
            <SurahGrid surahs={surahs} edition={edition.slug} coverage={coverageMap} />
          ) : (
            <p className="rounded-card border border-border bg-white p-6 text-sm text-muted">Couldn&apos;t load the surah list.</p>
          )}
        </div>
      </section>
    </div>
  );
}
