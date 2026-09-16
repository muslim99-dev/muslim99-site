import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurahWithTranslation } from "@/lib/quranApi";
import { TAFSIRS, getTafsirForSurah, findTafsir } from "@/lib/tafsir";
import TafsirEditionSwitcher from "@/components/TafsirEditionSwitcher";

export default async function TafsirSurahPage({
  params,
  searchParams
}: {
  params: { surah: string };
  searchParams: { edition?: string };
}) {
  const surahNumber = Number(params.surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  const editionSlug = findTafsir(searchParams.edition ?? "").slug;

  let surah, tafsirAyahs;
  try {
    [surah, tafsirAyahs] = await Promise.all([
      getSurahWithTranslation(surahNumber),
      getTafsirForSurah(editionSlug, surahNumber)
    ]);
  } catch {
    surah = null;
    tafsirAyahs = null;
  }

  if (!surah) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="rounded-card border border-border bg-white p-10">
          <p className="text-teal-dark font-medium">Couldn't load this surah's tafsir.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  const tafsirByAyah = new Map((tafsirAyahs ?? []).map((t) => [t.ayah, t.text]));
  const edition = findTafsir(editionSlug);

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-0 py-8">
      <Link href="/tafsir" className="text-xs text-primary-deep">
        ← All Surahs
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-teal-dark">
          {surah.number}. {surah.englishName}{" "}
          <span dir="rtl" className="font-quran text-lg">
            {surah.name}
          </span>
        </h1>
        <TafsirEditionSwitcher current={editionSlug} />
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {edition.name} — {edition.author}
      </p>

      <div className="mt-6 space-y-6">
        {surah.ayahs.map((a) => (
          <div key={a.globalNumber} className="rounded-card border border-border bg-white p-5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-aqua text-[11px] font-medium text-primary-deep">
              {a.numberInSurah}
            </span>
            <p dir="rtl" className="font-quran text-teal-dark text-xl mt-4 text-right leading-loose">
              {a.arabic}
            </p>
            {tafsirByAyah.get(a.numberInSurah) ? (
              <p dir="rtl" className="mt-4 text-[15px] leading-relaxed text-muted text-right border-t border-border pt-4">
                {tafsirByAyah.get(a.numberInSurah)}
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted italic border-t border-border pt-4">
                No commentary from this source for this verse.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
