import { searchQuranGlobal } from "@/lib/quranGlobalSearch.server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length < 2) {
    return Response.json({ matches: [] });
  }

  const matches = await searchQuranGlobal(q, 25);
  return Response.json({ matches });
}
