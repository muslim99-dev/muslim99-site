import Link from "next/link";
import { getSurahList } from "@/lib/quranApi";
import { TAFSIRS } from "@/lib/tafsir";

export const metadata = { title: "Tafsir — Muslim99" };

export default async function TafsirHome() {
  let surahs = [] as Awaited<ReturnType<typeof getSurahList>>;
  let error = false;
  try {
    surahs = await getSurahList();
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Tafsir</h1>
      <p className="mt-2 text-sm text-muted">
        {TAFSIRS.length} classical commentaries, each attributed to its named author. Pick a surah, then choose
        which tafsir to read.
      </p>

      {error ? (
        <div className="mt-10 rounded-card border border-border bg-white p-8 text-center">
          <p className="text-teal-dark font-medium">Couldn't load the surah list.</p>
          <p className="text-sm text-muted mt-1">Check your connection and try again.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {surahs.map((s) => (
            <Link
              key={s.number}
              href={`/tafsir/${s.number}`}
              className="flex items-center gap-3 rounded-card border border-border bg-white px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua text-[11px] font-medium text-primary-deep">
                {s.number}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-teal-dark">{s.englishName}</p>
                <p dir="rtl" className="truncate text-xs text-muted font-quran">
                  {s.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
