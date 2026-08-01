import { searchHadiths } from "@/lib/hadithSearch.server";
import type { LanguageCode } from "@/lib/hadith";

const VALID_LANGUAGES: LanguageCode[] = ["ara", "eng", "urd", "ben", "fra", "ind", "rus", "tur"];
const VALID_GRADES = ["sahih", "hasan", "daif"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const langParam = searchParams.get("lang") ?? "eng";
  const language = (VALID_LANGUAGES.includes(langParam as LanguageCode) ? langParam : "eng") as LanguageCode;
  const bookSlug = searchParams.get("book") ?? undefined;
  const gradeParam = searchParams.get("grade");
  const grade = VALID_GRADES.includes(gradeParam as (typeof VALID_GRADES)[number])
    ? (gradeParam as (typeof VALID_GRADES)[number])
    : undefined;

  if (q.trim().length < 2) {
    return Response.json({ results: [] });
  }

  const results = await searchHadiths(q, { language, bookSlug, grade }, 30);
  return Response.json({ results });
}
