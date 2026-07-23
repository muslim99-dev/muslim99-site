import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurah, getSurahIndex } from "@/lib/quran.server";
import QuranHeader from "@/components/quran/QuranHeader";
import MushafLines from "@/components/quran/MushafLines";

export async function generateStaticParams() {
  const index = await getSurahIndex();
  return index.map((s) => ({ surah: String(s.surahNumber) }));
}

export async function generateMetadata(props: PageProps<"/quran/[surah]/lines">): Promise<Metadata> {
  const { surah } = await props.params;
  const data = await getSurah(Number(surah));
  if (!data) return { title: "Surah not found" };
  const { details } = data;
  return {
    title: `Surah ${details.surahName} — 16-Line Mushaf Reading`,
    description: `Read Surah ${details.surahName} (${details.surahNameArabic}) in a clean, ~16-lines-per-page reading layout inspired by the traditional Indo-Pak mus-haf.`,
    alternates: { canonical: `/quran/${details.surahNumber}/lines` },
  };
}

export default async function SurahLinesPage(props: PageProps<"/quran/[surah]/lines">) {
  const { surah } = await props.params;
  const num = Number(surah);
  if (!Number.isInteger(num) || num < 1 || num > 114) notFound();

  const [data, index] = await Promise.all([getSurah(num), getSurahIndex()]);
  if (!data) notFound();

  const prev = index.find((s) => s.surahNumber === num - 1);
  const next = index.find((s) => s.surahNumber === num + 1);

  return (
    <>
      <QuranHeader backHref={`/quran/${num}`} backLabel="Back to surah" />
      <main className="min-h-screen">
        <MushafLines
          data={data}
          prevSurah={prev ? { surahNumber: prev.surahNumber, surahName: prev.surahName } : null}
          nextSurah={next ? { surahNumber: next.surahNumber, surahName: next.surahName } : null}
        />
      </main>
    </>
  );
}
