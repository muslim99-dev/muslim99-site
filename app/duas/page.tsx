import { getAyah } from "@/lib/quranApi";

export const metadata = { title: "Duas — Muslim99" };

// Well-known Qur'anic supplications, referenced by surah:ayah.
// Fetched live rather than hardcoded, so text and translation always
// come straight from the source edition.
const REFERENCES = ["2:201", "2:286", "3:8", "3:147", "7:23", "25:74"];

export default async function DuasPage() {
  const duas = await Promise.all(
    REFERENCES.map(async (ref) => {
      try {
        return await getAyah(ref);
      } catch {
        return null;
      }
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Qur'anic Duas</h1>
      <p className="mt-2 text-sm text-muted">
        A starting set of supplications drawn directly from the Qur'an, each shown with its exact reference. Duas
        from Hadith and daily-life categories (morning/evening, travel, forgiveness) require a licensed collection
        and will be added once that content source is connected.
      </p>

      <div className="mt-8 space-y-5">
        {duas.map(
          (d, i) =>
            d && (
              <div key={i} className="rounded-card border border-border bg-white p-6">
                <p className="text-xs text-primary-deep font-medium">
                  Surah {d.surah.englishName} {d.surah.number}:{d.numberInSurah}
                </p>
                <p dir="rtl" className="font-quran text-2xl text-teal-dark mt-4 text-right">
                  {d.arabic}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{d.translation}</p>
              </div>
            )
        )}
      </div>
    </div>
  );
}
