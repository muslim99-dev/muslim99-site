import { getSurahWithTranslation } from "@/lib/quranApi";
import { DEFAULT_TRANSLATION_ID, findTranslation } from "@/lib/translations";
import SurahReaderClient from "@/components/SurahReaderClient";
import { notFound } from "next/navigation";

export default async function SurahPage({
  params,
  searchParams
}: {
  params: { surah: string };
  searchParams: { translation?: string };
}) {
  const surahNumber = Number(params.surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  const editionId = findTranslation(searchParams.translation ?? DEFAULT_TRANSLATION_ID).id;

  let data;
  try {
    data = await getSurahWithTranslation(surahNumber, editionId);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="text-teal-dark font-medium">Couldn't load this surah.</p>
        <p className="text-sm text-muted mt-1">The Quran source may be temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-0 py-8">
      <SurahReaderClient
        surahNumber={data.number}
        englishName={data.englishName}
        arabicName={data.name}
        ayahs={data.ayahs}
        editionId={editionId}
      />
    </div>
  );
}
