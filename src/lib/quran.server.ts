// Server-only module: reads the Quran JSON from the filesystem for SSG.
// Do not import this from client components.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SurahSummary, SurahFile } from "./quran";

const DATA_ROOT = join(process.cwd(), "public", "quran_data");

async function readJson<T>(...segments: string[]): Promise<T> {
  const raw = await readFile(join(DATA_ROOT, ...segments), "utf8");
  return JSON.parse(raw) as T;
}

export async function getSurahIndex(): Promise<SurahSummary[]> {
  return readJson<SurahSummary[]>("index.json");
}

export async function getSurah(surahNumber: number): Promise<SurahFile | null> {
  try {
    return await readJson<SurahFile>(`Surah_${surahNumber}`, "verses.json");
  } catch {
    return null;
  }
}

// Every verse carries the same roster of translation/tafseer sources (some
// just have empty text where a scholar didn't cover a given verse), so one
// representative verse's file lengths reflect the real current counts —
// no need to scan all 6,236 verses just to count sources.
export async function getContentSourceCounts(): Promise<{ translations: number; tafaseer: number }> {
  try {
    const [translations, tafaseer] = await Promise.all([
      readJson<unknown[]>("Surah_2", "verses", "1", "translations.json"),
      readJson<unknown[]>("Surah_2", "verses", "1", "tafaseers.json"),
    ]);
    return { translations: translations.length, tafaseer: tafaseer.length };
  } catch {
    return { translations: 0, tafaseer: 0 };
  }
}
