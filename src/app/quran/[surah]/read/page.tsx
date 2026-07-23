import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurah, getSurahIndex } from "@/lib/quran.server";
import QuranHeader from "@/components/quran/QuranHeader";
import ContinuousReader from "@/components/quran/ContinuousReader";

export async function generateStaticParams() {
  const index = await getSurahIndex();
  return index.map((s) => ({ surah: String(s.surahNumber) }));
}

export async function generateMetadata(props: PageProps<"/quran/[surah]/read">): Promise<Metadata> {
  const { surah } = await props.params;
  const data = await getSurah(Number(surah));
  if (!data) return { title: "Surah not found" };
  const { details } = data;
  return {
    title: `Surah ${details.surahName} — Continuous Reading with Translation`,
    description: `Read Surah ${details.surahName} (${details.surahNameArabic}) as a flowing mus'haf-style page with translation, for regular, distraction-free reading.`,
    alternates: { canonical: `/quran/${details.surahNumber}/read` },
  };
}

export default async function SurahReadPage(props: PageProps<"/quran/[surah]/read">) {
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
        <ContinuousReader
          data={data}
          prevSurah={prev ? { surahNumber: prev.surahNumber, surahName: prev.surahName } : null}
          nextSurah={next ? { surahNumber: next.surahNumber, surahName: next.surahName } : null}
        />
      </main>
    </>
  );
}
