import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSurahList, getSurahWithTranslation } from "@/lib/quranApi";
import { getTafsir, findTafsir, getTafsirForSurah, translationFor, type TafsirAyah, type TafsirEdition } from "@/lib/tafsir";
import { EDITION_COOKIE } from "@/lib/tafsirPrefs";
import { ErrorCard } from "@/components/hadith/HadithUI";
import TafsirText from "@/components/tafsir/TafsirText";
import ReaderToolbar from "@/components/tafsir/ReaderToolbar";

const PAGE_SIZE = 10;

type Search = { edition?: string; compare?: string; page?: string; ayah?: string };

function resolveEdition(searchParams: Search) {
  return findTafsir(searchParams.edition ?? cookies().get(EDITION_COOKIE)?.value ?? "");
}

export async function generateMetadata({ params, searchParams }: { params: { surah: string }; searchParams: Search }) {
  return { title: `Surah ${params.surah} · ${resolveEdition(searchParams).name} — Tafsir — Muslim99` };
}

async function loadSurah(n: number, language: string) {
  try {
    return await getSurahWithTranslation(n, translationFor(language));
  } catch {
    return getSurahWithTranslation(n, "en.sahih");
  }
}

/** The Uthmani text source prefixes ayah 1 of every surah (except
 * Al-Fatiha, where it is ayah 1 itself) with the Bismillah, which isn't
 * part of that ayah — drop its first four words. */
function stripBismillah(text: string) {
  const words = text.trim().split(/\s+/);
  const bare = (w: string) => w.replace(/[ً-ٰٟۖ-ۭ]/g, "");
  return words.length > 4 && bare(words[0]).startsWith("بس") ? words.slice(4).join(" ") : text;
}

/** For an ayah with no commentary of its own: the nearest earlier ayah that
 * has one (its discussion usually covers the following verses). */
function coveredBy(ayah: number, byAyah: Map<number, string>) {
  for (let a = ayah - 1; a >= 1; a--) if (byAyah.has(a)) return a;
  return null;
}

function TafsirBlock({
  edition,
  ayah,
  byAyah,
  hrefFor,
  showName
}: {
  edition: TafsirEdition;
  ayah: number;
  byAyah: Map<number, string> | null;
  hrefFor: (ayah: number) => string;
  showName: boolean;
}) {
  const text = byAyah?.get(ayah);
  const ref = byAyah && !text ? coveredBy(ayah, byAyah) : null;
  return (
    <div className="min-w-0">
      {showName && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          {edition.name}
          <span className="font-normal normal-case tracking-normal text-muted"> · {edition.language}</span>
        </p>
      )}
      {byAyah === null ? (
        <p className="text-sm text-muted">Couldn&apos;t load this commentary right now.</p>
      ) : text ? (
        <div className="tf-body">
          <TafsirText text={text} language={edition.language} dir={edition.dir} />
        </div>
      ) : ref ? (
        <p className="flex items-center gap-2 rounded-2xl bg-bg px-4 py-3 text-sm text-muted">
          <span aria-hidden>↑</span>
          <span>
            Explained together with{" "}
            <Link href={hrefFor(ref)} className="font-medium text-primary-deep hover:underline">
              ayah {ref}
            </Link>
          </span>
        </p>
      ) : (
        <p className="rounded-2xl bg-bg px-4 py-3 text-sm text-muted">No commentary on this ayah in this edition.</p>
      )}
    </div>
  );
}

export default async function TafsirSurahPage({ params, searchParams }: { params: { surah: string }; searchParams: Search }) {
  const surahNumber = Number(params.surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  const edition = resolveEdition(searchParams);
  const compareCandidate = searchParams.compare ? getTafsir(searchParams.compare) : undefined;
  const compare = compareCandidate?.slug === edition.slug ? undefined : compareCandidate;

  const load = (slug: string) =>
    getTafsirForSurah(slug, surahNumber)
      .then((list: TafsirAyah[]) => new Map(list.map((t) => [t.ayah, t.text])))
      .catch(() => null);

  const [surah, surahList, primary, secondary] = await Promise.all([
    loadSurah(surahNumber, edition.language).catch(() => null),
    getSurahList().catch(() => []),
    load(edition.slug),
    compare ? load(compare.slug) : Promise.resolve(null)
  ]);

  if (!surah) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <ErrorCard title="Couldn't load this surah." detail="The Qur'an source may be temporarily unavailable." />
      </div>
    );
  }

  const totalPages = Math.ceil(surah.numberOfAyahs / PAGE_SIZE);
  const targetAyah = Number(searchParams.ayah);
  const hasTarget = Number.isInteger(targetAyah) && targetAyah > 0;
  const page = Math.min(Math.max(hasTarget ? Math.ceil(targetAyah / PAGE_SIZE) : Number(searchParams.page) || 1, 1), totalPages);
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, surah.numberOfAyahs);
  const ayahs = surah.ayahs
    .slice(first - 1, last)
    .map((a) => (a.numberInSurah === 1 && surahNumber !== 1 ? { ...a, arabic: stripBismillah(a.arabic) } : a));

  const query = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams({ edition: edition.slug });
    if (compare) p.set("compare", compare.slug);
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    return `?${p}`;
  };
  const hrefFor = (ayah: number) => `/tafsir/${surahNumber}${query({ ayah })}#ayah-${ayah}`;
  const pageHref = (p: number) => `/tafsir/${surahNumber}${query({ page: p })}`;
  const meta = (n: number) => surahList.find((s) => s.number === n);
  const prev = surahNumber > 1 ? meta(surahNumber - 1) : undefined;
  const next = surahNumber < 114 ? meta(surahNumber + 1) : undefined;

  const pagerButton = "rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-teal-dark transition-colors hover:border-primary";
  const Pager = () =>
    totalPages > 1 ? (
      <nav className="flex items-center justify-between gap-3" aria-label="Pages">
        {page > 1 ? (
          <Link href={pageHref(page - 1)} className={pagerButton}>
            ← Ayahs {first - PAGE_SIZE}–{first - 1}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-xs text-muted">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={pageHref(page + 1)} className={pagerButton}>
            Ayahs {last + 1}–{Math.min(last + PAGE_SIZE, surah.numberOfAyahs)} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    ) : null;

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8">
      {/* Surah header */}
      <header className="flex flex-col gap-3 border-b border-border py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/tafsir" className="text-xs font-medium text-primary-deep hover:underline">
            ← Tafsir library
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-teal-dark sm:text-3xl">
            <span className="text-muted">{surah.number}.</span> {surah.englishName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {meta(surahNumber)?.englishNameTranslation && `${meta(surahNumber)?.englishNameTranslation} · `}
            {surah.revelationType} · {surah.numberOfAyahs} ayahs
          </p>
        </div>
        <p dir="rtl" className="font-quran text-4xl leading-normal text-teal-dark">
          {surah.name}
        </p>
      </header>

      <ReaderToolbar
        surahs={surahList.map((s) => ({ number: s.number, englishName: s.englishName, numberOfAyahs: s.numberOfAyahs }))}
        surah={surahNumber}
        surahName={surah.englishName}
        totalAyahs={surah.numberOfAyahs}
        edition={{ slug: edition.slug, name: edition.name, dir: edition.dir }}
        compare={compare?.slug}
      />

      <div className="py-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
        {/* Ayah navigator */}
        <aside className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-card border border-border bg-white p-3">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Ayahs</p>
            <div className="mt-2 grid grid-cols-5 gap-1">
              {Array.from({ length: surah.numberOfAyahs }, (_, i) => i + 1).map((n) => {
                const onPage = n >= first && n <= last;
                const has = primary?.has(n);
                return (
                  <Link
                    key={n}
                    href={hrefFor(n)}
                    title={has ? `Ayah ${n}` : `Ayah ${n} — explained with an earlier ayah`}
                    className={`grid h-7 place-items-center rounded-md text-[11px] tabular-nums transition-colors ${
                      onPage ? "bg-teal-dark text-white" : has ? "bg-aqua/60 text-primary-deep hover:bg-aqua" : "text-muted hover:bg-bg"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 space-y-1 border-t border-border px-1 pt-3 text-[10px] text-muted">
              <p className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-aqua" /> Has its own commentary
              </p>
              <p className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-teal-dark" /> On this page
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {/* Edition attribution */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted">
              Reading{" "}
              <Link href={`/tafsir/edition/${edition.slug}`} className="font-medium text-teal-dark hover:text-primary-deep">
                {edition.name}
              </Link>
              {edition.author && <> by {edition.author}</>}
              {compare && (
                <>
                  {" "}
                  alongside{" "}
                  <Link href={`/tafsir/edition/${compare.slug}`} className="font-medium text-teal-dark hover:text-primary-deep">
                    {compare.name}
                  </Link>
                </>
              )}
            </p>
            <p className="text-xs text-muted">
              Ayahs {first}–{last} of {surah.numberOfAyahs}
            </p>
          </div>

          {primary === null && (
            <div className="mb-6">
              <ErrorCard title="Couldn't load this tafsir." detail="The tafsir server may be temporarily unavailable. Please try again shortly." />
            </div>
          )}

          {page === 1 && surahNumber !== 1 && surahNumber !== 9 && (
            <p dir="rtl" className="mb-6 text-center font-quran text-3xl text-teal-dark/80">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          )}

          <div className="space-y-6">
            {ayahs.map((a) => (
              <article
                key={a.globalNumber}
                id={`ayah-${a.numberInSurah}`}
                data-ayah={a.numberInSurah}
                className={`scroll-mt-24 sm:scroll-mt-40 overflow-hidden rounded-card border bg-white transition-shadow ${
                  hasTarget && targetAyah === a.numberInSurah ? "border-primary ring-4 ring-primary/15" : "border-border"
                }`}
              >
                <div className="px-5 pb-5 pt-5 sm:px-8 sm:pt-6">
                  <div className="flex items-start gap-4">
                    <Link
                      href={hrefFor(a.numberInSurah)}
                      className="mt-2 grid h-9 min-w-9 shrink-0 place-items-center rounded-full border border-gold/50 text-xs font-semibold tabular-nums text-gold"
                      title={`${surah.englishName} ${surah.number}:${a.numberInSurah}`}
                    >
                      {a.numberInSurah}
                    </Link>
                    <p dir="rtl" lang="ar" className="tf-arabic flex-1 text-right font-quran leading-[2.2] text-teal-dark">
                      {a.arabic}
                    </p>
                  </div>
                  {a.translation && (
                    <p
                      dir={edition.dir}
                      className={`tf-translation tf-body mt-4 text-muted ${
                        edition.language === "Urdu"
                          ? "font-urdu text-base leading-[2.2] text-right"
                          : edition.dir === "rtl"
                            ? "text-right leading-loose"
                            : "text-[15px] leading-relaxed sm:pl-[3.25rem]"
                      }`}
                    >
                      {a.translation}
                    </p>
                  )}
                </div>

                <div className={`border-t border-border bg-[#FCFEFE] px-5 py-6 sm:px-8 ${compare ? "grid gap-8 lg:grid-cols-2 lg:gap-10" : ""}`}>
                  <TafsirBlock edition={edition} ayah={a.numberInSurah} byAyah={primary} hrefFor={hrefFor} showName={!!compare} />
                  {compare && (
                    <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                      <TafsirBlock edition={compare} ayah={a.numberInSurah} byAyah={secondary} hrefFor={hrefFor} showName />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-xs sm:px-8">
                  <span className="text-muted">
                    {surah.englishName} {surah.number}:{a.numberInSurah}
                  </span>
                  <Link href={`/quran/${surah.number}#ayah-${a.numberInSurah}`} className="font-medium text-primary-deep hover:underline">
                    Listen in Qur&apos;an →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <Pager />
          </div>

          <nav className="mt-10 grid gap-3 border-t border-border pt-8 sm:grid-cols-2" aria-label="Surah navigation">
            {prev ? (
              <Link href={`/tafsir/${prev.number}${query({})}`} className="group rounded-card border border-border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">← Previous surah</p>
                <p className="mt-1 font-medium text-teal-dark group-hover:text-primary-deep">
                  {prev.number}. {prev.englishName}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/tafsir/${next.number}${query({})}`} className="group rounded-card border border-border bg-white p-4 text-right transition-all hover:border-primary/40 hover:shadow-card">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Next surah →</p>
                <p className="mt-1 font-medium text-teal-dark group-hover:text-primary-deep">
                  {next.number}. {next.englishName}
                </p>
              </Link>
            )}
          </nav>

          <p className="mt-8 pb-4 text-center text-xs text-muted">
            Commentary: {edition.name}
            {edition.author && ` by ${edition.author}`}
            {compare && ` and ${compare.name}${compare.author ? ` by ${compare.author}` : ""}`}. Qur&apos;an text and translation via AlQuran Cloud.
          </p>
        </main>
      </div>
    </div>
  );
}
