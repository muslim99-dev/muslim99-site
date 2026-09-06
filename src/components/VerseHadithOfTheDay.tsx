import { BookOpen, ScrollText } from "lucide-react";
import Eyebrow from "./Eyebrow";
import ShareButtons from "./ShareButtons";
import { getVerseOfDay, getHadithOfDay } from "@/lib/dailyContent.server";

export default async function VerseHadithOfTheDay() {
  const [verse, hadith] = await Promise.all([getVerseOfDay(), getHadithOfDay()]);
  if (!verse && !hadith) return null;

  const verseReference = verse ? `Surah ${verse.surahName} · ${verse.surahNumber}:${verse.verseNumber}` : "";
  const hadithReference = hadith
    ? [hadith.collectionName, hadith.bookNumber ? `Book ${hadith.bookNumber}, Hadith ${hadith.hadithNumber}` : `Hadith ${hadith.hadithNumber}`, hadith.grade]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <section id="quran" className="relative py-24 sm:py-32" style={{ background: "var(--card-2)" }}>
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.18]" />
      <div className="relative mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>Read, reflect, remember</Eyebrow>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]" style={{ color: "var(--text)" }}>
            The Quran and Sunnah, close at hand
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {verse && (
            <div className="card-surface flex flex-col p-8 sm:p-10">
              <div className="flex items-center gap-2.5" style={{ color: "var(--primary)" }}>
                <BookOpen size={20} />
                <span className="text-[13px] font-semibold uppercase tracking-wider">Verse of the day</span>
              </div>
              <p dir="rtl" className="font-arabic mt-7 text-[26px] leading-[1.9]" style={{ color: "var(--text)" }}>
                {verse.arabic}
              </p>
              <p className="mt-6 text-[15.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                &ldquo;{verse.english}&rdquo;
              </p>
              <p className="mt-6 text-[13.5px] font-semibold" style={{ color: "var(--soft-text)" }}>
                {verseReference}
              </p>
              <ShareButtons
                content={{
                  label: "VERSE OF THE DAY",
                  primaryText: verse.arabic,
                  primaryScript: "quran",
                  secondaryText: verse.english,
                  reference: verseReference,
                }}
                shareText={`${verse.arabic}\n"${verse.english}"\n\n— ${verseReference}`}
              />
            </div>
          )}

          {hadith && (
            <div className="card-surface flex flex-col p-8 sm:p-10">
              <div className="flex items-center gap-2.5" style={{ color: "var(--primary)" }}>
                <ScrollText size={20} />
                <span className="text-[13px] font-semibold uppercase tracking-wider">Hadith of the day</span>
              </div>
              {hadith.arabic && (
                <p dir="rtl" className="font-arabic-text mt-7 text-[24px] leading-[1.9]" style={{ color: "var(--text)" }}>
                  {hadith.arabic}
                </p>
              )}
              <p className="mt-6 text-[15.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                &ldquo;{hadith.english}&rdquo;
              </p>
              <p className="mt-6 text-[13.5px] font-semibold" style={{ color: "var(--soft-text)" }}>
                {hadithReference}
              </p>
              <ShareButtons
                content={{
                  label: "HADITH OF THE DAY",
                  primaryText: hadith.arabic ?? hadith.english,
                  primaryScript: "arabic",
                  secondaryText: hadith.arabic ? hadith.english : null,
                  reference: hadithReference,
                }}
                shareText={`${hadith.arabic ? `${hadith.arabic}\n` : ""}"${hadith.english}"\n\n— ${hadithReference}`}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
