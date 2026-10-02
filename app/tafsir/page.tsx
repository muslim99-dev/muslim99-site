import { cookies } from "next/headers";
import { getSurahList } from "@/lib/quranApi";
import { DEFAULT_TAFSIR, TAFSIRS, tafsirLanguages } from "@/lib/tafsir";
import { EDITION_COOKIE } from "@/lib/tafsirPrefs";
import { HeroStat, PageHero } from "@/components/hadith/HadithUI";
import TafsirHomeClient from "@/components/tafsir/TafsirHomeClient";

export const metadata = {
  title: "Tafsir — Muslim99",
  description: `${TAFSIRS.length} Qur'an commentaries in ${tafsirLanguages().length} languages — classical Arabic tafsir, Urdu, English and more.`
};

export default async function TafsirHome() {
  const surahs = await getSurahList().catch(() => null);
  const initialEdition = cookies().get(EDITION_COOKIE)?.value ?? DEFAULT_TAFSIR;

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8 sm:py-10">
      <PageHero
        eyebrow="Commentary on the Qur'an"
        title="Tafsir"
        subtitle="Understand every ayah with the great commentaries — choose your language and tafsir once, then read any surah."
        arabic="تفسير القرآن الكريم"
      >
        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          <HeroStat value={TAFSIRS.length} label="Tafsirs" />
          <HeroStat value={tafsirLanguages().length} label="Languages" />
          <HeroStat value={114} label="Surahs" />
        </div>
      </PageHero>

      <div className="mt-6">
        <TafsirHomeClient surahs={surahs} initialEdition={initialEdition} />
      </div>
    </div>
  );
}
