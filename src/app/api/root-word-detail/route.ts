// Extracts just the meaning + occurrence text from an al-hadees.com
// root-word detail page, so the Quran reader can show it inline in its own
// styled panel instead of embedding that site's whole page (with its nav,
// footer, branding, and ads). This is the one deliberate exception to the
// site's static-only architecture, mirroring /api/translate.
//
// Restricted to al-hadees.com/alquran-root-details/* — the only source this
// data ever comes from (see RootWord.detailUrl in the Quran dataset) — so
// this can't be used as an open URL-fetching proxy.

import * as cheerio from "cheerio";

const ALLOWED_ORIGIN = "https://al-hadees.com";
const ALLOWED_PATH_PREFIX = "/alquran-root-details/";

export interface RootWordOccurrence {
  word: string;
  surahName: string;
  surahNumber: number | null;
  verseNumber: number | null;
}

export interface RootWordDetail {
  word: string | null;
  wordsFoundLabel: string | null;
  meaning: string | null;
  occurrences: RootWordOccurrence[];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return Response.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ error: "Invalid url" }, { status: 400 });
  }
  if (parsed.origin !== ALLOWED_ORIGIN || !parsed.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
    return Response.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const word = $(".alert-secondary h1.font-arabic3").first().text().trim() || null;
    const wordsFoundLabel = $(".alert-secondary h6").first().text().trim() || null;
    // The page reuses ".font-urdu.h5" for an unrelated modal elsewhere, so
    // anchor off the "Lughaat" (meaning) heading specifically rather than
    // taking the first match of that class pair.
    const lughaatHeading = $("h5").filter((_, el) => $(el).text().trim() === "Lughaat").first();
    const meaning = lughaatHeading.parent().find(".alert-white p, .font-urdu").first().text().trim() || null;

    const occurrences: RootWordOccurrence[] = [];
    $("table tr").each((_, row) => {
      const $row = $(row);
      if ($row.hasClass("bg-secondary")) return; // header row
      const cells = $row.find("td");
      if (cells.length < 3) return;
      const occWord = $(cells[0]).text().trim();
      const surahCell = $(cells[1]).text().trim(); // e.g. "البقرة(2)"
      const verseCell = $(cells[2]).text().trim();
      const match = surahCell.match(/\((\d+)\)\s*$/);
      if (!occWord) return;
      occurrences.push({
        word: occWord,
        surahName: surahCell.replace(/\(\d+\)\s*$/, "").trim(),
        surahNumber: match ? Number(match[1]) : null,
        verseNumber: verseCell ? Number(verseCell) : null,
      });
    });

    const detail: RootWordDetail = { word, wordsFoundLabel, meaning, occurrences };
    return Response.json(detail);
  } catch {
    return Response.json({ error: "Failed to fetch detail" }, { status: 502 });
  }
}
