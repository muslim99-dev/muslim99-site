import type { Metadata } from "next";
import { getBooks } from "@/lib/hadith.server";
import HadithHeader from "@/components/hadith/HadithHeader";
import BookBrowser from "@/components/hadith/BookBrowser";
import SearchTriggerButton from "@/components/hadith/SearchTriggerButton";
import Eyebrow from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Hadith Collection — 18 Classical Books",
  description:
    "Read 18 classical hadith collections — including the six major books (Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah) plus Musnad Ahmad, Muwatta Imam Malik, Mishkat al-Masabih, and more — with Arabic text, translation, grading, and scholarly explanation for every hadith.",
  alternates: { canonical: "/hadith" },
};

export default async function HadithIndexPage() {
  const books = await getBooks();
  const totalHadiths = books.reduce((sum, b) => sum + b.totalHadiths, 0);
  const languageCount = new Set(books.flatMap((b) => b.languages.map((l) => l.code))).size;

  return (
    <>
      <HadithHeader />
      <main className="relative min-h-screen pb-24">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.14]" />
          <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-10 text-center sm:pt-20">
            <div className="flex justify-center">
              <Eyebrow>The words and life of the Prophet ﷺ</Eyebrow>
            </div>
            <p dir="rtl" className="font-arabic mx-auto mt-6 text-[28px] leading-tight sm:text-[36px]" style={{ color: "var(--soft-text)" }}>
              كُتُبُ الْحَدِيْثِ
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.8rem]" style={{ color: "var(--text)" }}>
              The Hadith Collection
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
              18 classical hadith collections — book by book, chapter by chapter — with narrator, grading,
              scholarly explanation, and reference for every hadith.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-8">
              <Stat value={String(books.length)} label="Books" />
              <Divider />
              <Stat value={totalHadiths.toLocaleString()} label="Hadiths" />
              <Divider />
              <Stat value={String(languageCount)} label="Languages" />
            </div>

            <SearchTriggerButton />
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6">
          <BookBrowser books={books} />
        </section>
      </main>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[26px] font-bold leading-none" style={{ color: "var(--primary)" }}>
        {value}
      </p>
      <p className="mt-1 text-[12.5px] font-medium uppercase tracking-wider" style={{ color: "var(--faint)" }}>
        {label}
      </p>
    </div>
  );
}

function Divider() {
  return <span className="h-8 w-px" style={{ background: "var(--border)" }} />;
}
