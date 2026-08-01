import { getBookEdition } from "@/lib/hadith.server";
import type { LanguageCode } from "@/lib/hadith";

const VALID_LANGUAGES: LanguageCode[] = ["ara", "eng", "urd", "ben", "fra", "ind", "rus", "tur"];

export async function GET(req: Request, ctx: RouteContext<"/api/hadith/[book]/[chapter]">) {
  const { book, chapter } = await ctx.params;
  const chapterNumber = Number(chapter);
  const { searchParams } = new URL(req.url);
  const langParam = searchParams.get("lang") ?? "eng";
  const language = (VALID_LANGUAGES.includes(langParam as LanguageCode) ? langParam : "eng") as LanguageCode;

  if (!Number.isInteger(chapterNumber)) {
    return Response.json({ error: "Invalid chapter number" }, { status: 400 });
  }

  const edition = await getBookEdition(book, language);
  if (!edition) {
    return Response.json({ error: "Not available in this language" }, { status: 404 });
  }

  const chapterInfo = edition.chapters.find((c) => c.number === chapterNumber) ?? null;
  const hadiths = edition.hadiths.filter((h) => h.chapterNumber === chapterNumber);

  return Response.json({ chapter: chapterInfo, hadiths, direction: edition.direction });
}
