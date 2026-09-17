import Link from "next/link";
import { getCollections, getCollectionLanguages } from "@/lib/hadith";
import HadithSearchBox from "@/components/HadithSearchBox";

export const metadata = { title: "Hadith — Muslim99" };

export default async function HadithPage() {
  let collections;
  try {
    collections = await getCollections();
  } catch {
    collections = null;
  }

  if (!collections) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="rounded-card border border-border bg-white p-10">
          <p className="text-teal-dark font-medium">Couldn't load the hadith library.</p>
          <p className="text-sm text-muted mt-1">The source may be temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  const totalHadiths = collections.reduce((sum, c) => sum + c.total_hadiths, 0);
  const languagesBySlug = new Map(
    await Promise.all(collections.map(async (c) => [c.slug, await getCollectionLanguages(c.slug)] as const))
  );

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Hadith</h1>
      <p className="mt-2 text-sm text-muted">
        {collections.length} classical collections, {totalHadiths.toLocaleString()} hadiths total. Every collection
        has Arabic text and Urdu translation; some also include an English translation, shown on each card below.
      </p>

      <div className="mt-6">
        <HadithSearchBox mode="hadiths" placeholder="Search hadith text across all 18 collections…" />
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/hadith/${c.slug}`}
            className="rounded-card border border-border bg-white p-5 transition-transform hover:-translate-y-0.5"
          >
            <p className="font-medium text-teal-dark">{c.name}</p>
            {c.name_urdu && (
              <p dir="rtl" className="mt-1 text-sm text-muted font-urdu">
                {c.name_urdu}
              </p>
            )}
            <p className="mt-1.5 text-xs text-muted">
              {c.total_hadiths.toLocaleString()} hadiths · {c.total_books} books
            </p>
            {(languagesBySlug.get(c.slug)?.length ?? 0) > 0 && (
              <p className="mt-1.5 text-[11px] text-primary-deep">
                {languagesBySlug.get(c.slug)!.join(" · ")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
