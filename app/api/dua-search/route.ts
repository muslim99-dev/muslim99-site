import { NextRequest, NextResponse } from "next/server";
import { searchDuas } from "@/lib/duas";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });
  if (q.length > 100) return NextResponse.json({ error: "Query too long" }, { status: 400 });

  const results = searchDuas(q, 30).map((r) => ({
    id: r.dua.id,
    href: `/duas/${r.categorySlug}#${r.dua.id}`,
    category: r.categoryTitle,
    chapter: r.chapterTitle,
    arabic: r.dua.arabic.slice(0, 160),
    translation: (r.dua.translations[0]?.text ?? "").slice(0, 200),
    reference: r.dua.reference
  }));
  return NextResponse.json({ results });
}
