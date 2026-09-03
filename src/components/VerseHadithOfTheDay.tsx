import { BookOpen, BookMarked } from "lucide-react";
import { getVerseOfDay, getHadithOfDay } from "@/lib/dailyContent.server";
import ShareButtons from "./ShareButtons";
import type { ShareImageContent } from "@/lib/shareImage";

export default async function VerseHadithOfTheDay() {
  const [verse, hadith] = await Promise.all([getVerseOfDay(), getHadithOfDay()]);
  if (!verse && !hadith) return null;

  return (
    <section id="quran" className="relative py-24 sm:py-32" style={{ background: "var(--card-2)" }}>
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.18]" />
      <div className="relative mx-auto max-w-[1200px] px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-[2.6rem]" style={{ color: "var(--text)" }}>
          Daily Inspiration
        </h2>

        <div className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2">
          {hadith && (
            <InspirationCard
              icon={BookOpen}
              title="Hadith of the Day"
              label="Hadith"
              reference={`${hadith.collectionName} # ${hadith.hadithNumber}`}
              share={{
                label: "HADITH OF THE DAY",
                primaryText: hadith.arabic ?? hadith.text,
                primaryScript: "arabic",
                secondaryText: hadith.arabic ? hadith.text : null,
                reference: `${hadith.collectionName} # ${hadith.hadithNumber}`,
              }}
              shareText={`${hadith.text}\n\n— ${hadith.collectionName} # ${hadith.hadithNumber}`}
            >
              {hadith.arabic && (
                <>
                  <p dir="rtl" lang="ar" className="font-arabic-text text-[22px] leading-[2]" style={{ color: "var(--text)" }}>
                    {hadith.arabic}
                  </p>
                  <div className="my-4 border-t" style={{ borderColor: "var(--hair)" }} />
                </>
              )}
              <p dir="rtl" lang="ur" className="font-urdu text-[20px] leading-[2]" style={{ color: "var(--text)" }}>
                {hadith.text}
              </p>
            </InspirationCard>
          )}
          {verse && (
            <InspirationCard
              icon={BookMarked}
              title="Ayat of the Day"
              label="Verse"
              reference={`Surah ${verse.surahName} [${verse.surahNumber}-${verse.verseNumber}]`}
              share={{
                label: "VERSE OF THE DAY",
                primaryText: verse.arabic,
                primaryScript: "quran",
                secondaryText: verse.urdu,
                reference: `Surah ${verse.surahName} [${verse.surahNumber}-${verse.verseNumber}]`,
              }}
              shareText={`${verse.arabic}\n${verse.urdu}\n\n— Surah ${verse.surahName} [${verse.surahNumber}-${verse.verseNumber}]`}
            >
              <p dir="rtl" lang="ar" className="font-arabic text-[22px] leading-[2]" style={{ color: "var(--text)" }}>
                {verse.arabic}
              </p>
              <div className="my-4 border-t" style={{ borderColor: "var(--hair)" }} />
              <p dir="rtl" lang="ur" className="font-urdu text-[20px] leading-[2]" style={{ color: "var(--text)" }}>
                {verse.urdu}
              </p>
            </InspirationCard>
          )}
        </div>
      </div>
    </section>
  );
}

function InspirationCard({
  icon: Icon,
  title,
  label,
  reference,
  share,
  shareText,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  label: string;
  reference: string;
  share: ShareImageContent;
  shareText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-[1.5rem] border pt-14 pb-8" style={{ borderColor: "var(--primary)", background: "var(--card)" }}>
      <div
        className="absolute left-1/2 top-0 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg"
        style={{ background: "var(--grad-btn)", boxShadow: "var(--shadow-md)" }}
      >
        <Icon size={30} color="white" />
      </div>

      <h3 className="text-center text-[19px] font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </h3>

      <div className="mt-8 px-6 text-center sm:px-8">
        <div className="text-left">
          <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
            {label}
          </p>
          <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            {reference}
          </p>
        </div>
        <div className="mt-4 text-right">{children}</div>
      </div>

      <ShareButtons content={share} shareText={shareText} />
    </div>
  );
}
