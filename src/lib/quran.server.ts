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
