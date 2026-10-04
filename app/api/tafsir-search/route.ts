import { NextRequest, NextResponse } from "next/server";
import { getTafsir } from "@/lib/tafsir";
import { searchTafsir } from "@/lib/tafsirData";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const q = p.get("q")?.trim() ?? "";
  const edition = p.get("edition") ?? "";
  const surah = Number(p.get("surah")) || undefined;
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });
  if (q.length > 200) return NextResponse.json({ error: "Query too long" }, { status: 400 });
  if (!getTafsir(edition)) return NextResponse.json({ error: "Unknown edition" }, { status: 400 });

  try {
    const { count, results } = await searchTafsir(edition, q, { surah, limit: 25 });
    return NextResponse.json({ count, results: results.map((r) => ({ ...r, snippet: r.snippet.slice(0, 320) })) });
  } catch {
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 502 });
  }
}
