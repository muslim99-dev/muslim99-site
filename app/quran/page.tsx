import { getSurahList } from "@/lib/quranApi";
import Link from "next/link";
import SurahListClient from "@/components/SurahListClient";
import { HeroStat, PageHero } from "@/components/hadith/HadithUI";
import { TRANSLATIONS } from "@/lib/translations";
import { RECITERS } from "@/lib/reciters";

export const metadata = {
  title: "Read Quran Online — All 114 Surahs with Translation | Muslim99",
  description:
    "Read the Holy Qur'an online: all 114 surahs in Arabic with English and Urdu translations, audio recitation by renowned qaris, and tafsir for every ayah.",
  alternates: { canonical: "/quran" }
};

export default async function QuranHome() {
  let surahs = [] as Awaited<ReturnType<typeof getSurahList>>;
  let error = false;
  try {
    surahs = await getSurahList();
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8 sm:py-10">
      <PageHero
        eyebrow="The Noble Qur'an"
        title="Read the Quran"
        subtitle="All 114 surahs in the original Arabic, with translations from renowned scholars in many languages, verse-by-verse recitation from famous qaris, and tafsir for every ayah."
        arabic="القرآن الكريم"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:max-w-2xl sm:flex-1 sm:grid-cols-4">
            <HeroStat value={114} label="Surahs" />
            <HeroStat value={6236} label="Ayahs" />
            <HeroStat value={TRANSLATIONS.length} label="Translations" />
            <HeroStat value={RECITERS.length} label="Reciters" />
          </div>
          <Link
            href="/bookmarks"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-medium text-teal-dark shadow-sm transition-colors hover:bg-aqua sm:self-auto"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
            </svg>
            My Bookmarks
          </Link>
        </div>
      </PageHero>

      {error ? (
        <div className="mt-10 rounded-card border border-border bg-white p-8 text-center">
          <p className="text-teal-dark font-medium">Couldn't load the surah list.</p>
          <p className="text-sm text-muted mt-1">Check your connection and try again.</p>
        </div>
      ) : (
        <div className="mt-6">
          <SurahListClient surahs={surahs} />
        </div>
      )}
    </div>
  );
}
