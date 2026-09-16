import { getSurahList } from "@/lib/quranApi";
import SurahListClient from "@/components/SurahListClient";

export const metadata = { title: "Quran — Muslim99" };

export default async function QuranHome() {
  let surahs = [] as Awaited<ReturnType<typeof getSurahList>>;
  let error = false;
  try {
    surahs = await getSurahList();
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">The Quran</h1>
      <p className="mt-2 text-sm text-muted">All 114 surahs, with Arabic text, translation, and audio.</p>

      {error ? (
        <div className="mt-10 rounded-card border border-border bg-white p-8 text-center">
          <p className="text-teal-dark font-medium">Couldn't load the surah list.</p>
          <p className="text-sm text-muted mt-1">Check your connection and try again.</p>
        </div>
      ) : (
        <div className="mt-8">
          <SurahListClient surahs={surahs} />
        </div>
      )}
    </div>
  );
}
