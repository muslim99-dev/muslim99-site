import Link from "next/link";
import { notFound } from "next/navigation";
import { getHadithBook, getHadithEdition, getSections, getHadithsInSection } from "@/lib/hadith";
import HadithEditionSwitcher from "@/components/HadithEditionSwitcher";

export default async function HadithSectionPage({
  params,
  searchParams
}: {
  params: { book: string; section: string };
  searchParams: { edition?: string };
}) {
  const sectionNumber = Number(params.section);
  const book = await getHadithBook(params.book);
  if (!book || !Number.isInteger(sectionNumber)) notFound();

  const editionName = book.editions.find((e) => e.name === searchParams.edition)?.name ?? book.editions[0].name;

  let edition;
  try {
    edition = await getHadithEdition(editionName);
  } catch {
    edition = null;
  }

  if (!edition) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="rounded-card border border-border bg-white p-10">
          <p className="text-teal-dark font-medium">Couldn't load this chapter.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  const section = getSections(edition).find((s) => s.number === sectionNumber);
  if (!section) notFound();
  const hadiths = getHadithsInSection(edition, sectionNumber);
  const currentEdition = book.editions.find((e) => e.name === editionName);
  const isRtl = currentEdition?.direction === "rtl";

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-0 py-8">
      <Link href={`/hadith/${book.slug}?edition=${editionName}`} className="text-xs text-primary-deep">
        ← {book.name}
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-teal-dark">
          {section.number}. {section.title}
        </h1>
        <HadithEditionSwitcher editions={book.editions} current={editionName} />
      </div>

      {currentEdition && currentEdition.language !== "English" && (
        <p className="mt-2 text-[11px] text-muted">
          The chapter title above is in English (the source has no {currentEdition.language} version of it) — the
          hadith text below is in {currentEdition.language}.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {hadiths.map((h) => (
          <div key={h.hadithnumber} className="rounded-card border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua text-[11px] font-medium text-primary-deep">
                {h.hadithnumber}
              </span>
              {h.grades.length > 0 && (
                <span className="text-[11px] text-muted">
                  {h.grades.map((g) => `${g.name}: ${g.grade}`).join(" · ")}
                </span>
              )}
            </div>
            <p dir={isRtl ? "rtl" : "ltr"} className={`mt-3 text-[15px] leading-relaxed text-teal-dark ${isRtl ? "text-right font-quran text-xl" : ""}`}>
              {h.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
