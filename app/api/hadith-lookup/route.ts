import { NextResponse } from "next/server";
import { getChapter, getCollection } from "@/lib/hadith";
import { locationKey, parseHadithRefId } from "@/lib/hadithRefs";

export type HadithPreview = {
  key: string;
  slug: string;
  book: number;
  chapter: number;
  hadith: number;
  collectionName: string;
  chapterTitle: string;
  status?: string;
  arabic: string;
  translation: string;
};

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

/** Resolves saved-hadith refIds (bookmark or favourite form) to short
 * previews, so lists of saved items can show real text, not bare ids. */
export async function POST(req: Request) {
  const { refs } = await req.json().catch(() => ({}));
  if (!Array.isArray(refs)) return NextResponse.json({ error: "refs must be an array." }, { status: 400 });

  const locations = refs
    .slice(0, 200)
    .map((r) => (typeof r === "string" ? parseHadithRefId(r) : null))
    .filter((l): l is NonNullable<typeof l> => !!l);

  const previews = await Promise.all(
    locations.map(async (loc): Promise<HadithPreview | null> => {
      try {
        const [collection, chapter] = await Promise.all([
          getCollection(loc.slug),
          getChapter(loc.slug, loc.book, loc.chapter)
        ]);
        const h = chapter.hadiths.find((x) => x.hadith_number === loc.hadith);
        if (!collection || !h) return null;
        return {
          key: locationKey(loc),
          slug: loc.slug,
          book: loc.book,
          chapter: loc.chapter,
          hadith: loc.hadith,
          collectionName: collection.name,
          chapterTitle: chapter.english || chapter.urdu || chapter.arabic || `Chapter ${loc.chapter}`,
          status: h.status,
          arabic: clip(h.arabic_text || "", 220),
          translation: clip(h.english_translation || h.urdu_translation || "", 260)
        };
      } catch {
        return null;
      }
    })
  );

  const unique = new Map<string, HadithPreview>();
  for (const p of previews) if (p && !unique.has(p.key)) unique.set(p.key, p);
  return NextResponse.json({ previews: Object.fromEntries(unique) });
}
