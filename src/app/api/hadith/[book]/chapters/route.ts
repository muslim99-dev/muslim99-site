import { getBookEdition } from "@/lib/hadith.server";
import type { LanguageCode } from "@/lib/hadith";

const VALID_LANGUAGES: LanguageCode[] = ["ara", "eng", "urd", "ben", "fra", "ind", "rus", "tur"];

export async function GET(req: Request, ctx: RouteContext<"/api/hadith/[book]/chapters">) {
  const { book } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const langParam = searchParams.get("lang") ?? "eng";
  const language = (VALID_LANGUAGES.includes(langParam as LanguageCode) ? langParam : "eng") as LanguageCode;

  const edition = await getBookEdition(book, language);
  if (!edition) {
    return Response.json({ error: "Not available in this language" }, { status: 404 });
  }

  return Response.json({ chapters: edition.chapters, direction: edition.direction });
}
