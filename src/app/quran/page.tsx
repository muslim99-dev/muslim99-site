import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, Rows3, Mic2, ArrowRight } from "lucide-react";
import { getSurahIndex } from "@/lib/quran.server";
import { RECITATION_VOICES } from "@/lib/reciters";
import QuranHeader from "@/components/quran/QuranHeader";
import SurahBrowser from "@/components/quran/SurahBrowser";
import Eyebrow from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "The Holy Quran — All 114 Surahs",
  description:
    "Read the Holy Quran with Arabic text, word-by-word meaning, multiple Urdu, English and Hindi translations, tafseer from renowned scholars, and root-word breakdowns. Search and filter across all 114 surahs.",
  alternates: { canonical: "/quran" },
};

export default async function QuranIndexPage() {
  const surahs = await getSurahIndex();

  const totalVerses = surahs.reduce((sum, s) => sum + s.totalVerses, 0);

  return (
    <>
      <QuranHeader />
      <main className="relative min-h-screen pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.14]" />
          <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-10 text-center sm:pt-20">
            <div className="flex justify-center">
              <Eyebrow>Read, reflect, remember</Eyebrow>
            </div>
            <p dir="rtl" className="font-arabic mx-auto mt-6 text-[30px] leading-tight sm:text-[38px]" style={{ color: "var(--soft-text)" }}>
              الْقُرْآنُ الْكَرِيْم
            </p>
            <h1
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.8rem]"
              style={{ color: "var(--text)" }}
            >
              The Holy Quran
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
              All {surahs.length} surahs with Arabic, word-by-word meaning, multiple translations,
              tafseer from renowned scholars, and root-word breakdowns.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-8">
              <Stat value={String(surahs.length)} label="Surahs" />
              <Divider />
              <Stat value={totalVerses.toLocaleString()} label="Verses" />
              <Divider />
              <Stat value="7+" label="Tafaseer" />
            </div>
          </div>
        </section>

        {/* Reading modes */}
        <section className="relative mx-auto max-w-6xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Link
              href="/quran/1/read"
              className="card-surface group relative overflow-hidden p-7 transition-transform duration-300 hover:-translate-y-1.5 sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.08]" />
              <div className="relative">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  <BookMarked size={22} />
                </div>
                <h2 className="mt-5 text-[19px] font-semibold" style={{ color: "var(--text)" }}>
                  Complete Quran — regular reading
                </h2>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  A flowing, mus&rsquo;haf-style page for distraction-free reading — Arabic text with
                  translation alongside, surah after surah, from Al-Fatiha onward.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--primary)" }}>
                  Start reading <ArrowRight size={15} />
                </span>
              </div>
            </Link>

            <Link
              href="/quran/1/lines"
              className="card-surface group relative overflow-hidden p-7 transition-transform duration-300 hover:-translate-y-1.5 sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.08]" />
              <div className="relative">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                >
                  <Rows3 size={22} />
                </div>
                <h2 className="mt-5 text-[19px] font-semibold" style={{ color: "var(--text)" }}>
                  16-line mus&rsquo;haf style
                </h2>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  A clean, page-by-page Arabic layout in the spirit of the traditional Indo-Pak 16-line
                  Quran — ideal for memorization and quiet recitation.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--gold)" }}>
                  Start reading <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          </div>

          <div className="card-surface mt-5 flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "var(--soft)", color: "var(--primary)" }}
            >
              <Mic2 size={20} />
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
              <strong style={{ color: "var(--text)" }}>{RECITATION_VOICES.length} qari voices</strong> are
              available ayah-by-ayah in every reading mode — pick yours from the mic icon in the header, play a
              single ayah or the complete surah, and optionally continue straight into the next surah.
            </p>
          </div>
        </section>

        {/* Browser */}
        <section className="relative mx-auto max-w-6xl px-6">
          <SurahBrowser surahs={surahs} />
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
