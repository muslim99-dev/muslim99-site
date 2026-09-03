import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurah, getSurahIndex } from "@/lib/quran.server";
import Navbar from "@/components/Navbar";
import SurahReader from "@/components/quran/SurahReader";
import QariSelector from "@/components/quran/QariSelector";

export async function generateStaticParams() {
  const index = await getSurahIndex();
  return index.map((s) => ({ surah: String(s.surahNumber) }));
}

export async function generateMetadata(props: PageProps<"/quran/[surah]">): Promise<Metadata> {
  const { surah } = await props.params;
  const data = await getSurah(Number(surah));
  if (!data) return { title: "Surah not found" };
  const { details } = data;
  return {
    title: `Surah ${details.surahName} (${details.surahNameTranslation}) — Read with Tafseer`,
    description: `Read Surah ${details.surahName} (${details.surahNameArabic}) — ${details.totalVerses} verses, ${details.revelationPlace}. Arabic text, word-by-word meaning, Urdu/English/Hindi translations, tafseer and root words.`,
    alternates: { canonical: `/quran/${details.surahNumber}` },
  };
}

export default async function SurahPage(props: PageProps<"/quran/[surah]">) {
  const { surah } = await props.params;
  const num = Number(surah);
  if (!Number.isInteger(num) || num < 1 || num > 114) notFound();

  const [data, index] = await Promise.all([getSurah(num), getSurahIndex()]);
  if (!data) notFound();

  const prev = index.find((s) => s.surahNumber === num - 1);
  const next = index.find((s) => s.surahNumber === num + 1);

  return (
    <>
      <Navbar backHref="/quran" backLabel="All surahs" extra={<QariSelector />} />
      <main className="min-h-screen pt-24 sm:pt-28">
        <SurahReader
          data={data}
          prevSurah={prev ? { surahNumber: prev.surahNumber, surahName: prev.surahName } : null}
          nextSurah={next ? { surahNumber: next.surahNumber, surahName: next.surahName } : null}
        />
      </main>
    </>
  );
}
