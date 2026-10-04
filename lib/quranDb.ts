/**
 * Server-only reader for the Qur'an translations and Urdu tafsirs taken
 * from quran.db (see scripts/build-quran-db.mjs), stored as gzipped JSON in
 * data/quran_db. The edition lists live in lib/translations.ts and
 * lib/tafsir.ts, which are also used by client components, so all file
 * access stays here.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import { getSurahArabicWith, getSurahWithTranslation } from "./quranApi";

const ROOT = path.join(process.cwd(), "data", "quran_db");
const gunzipAsync = promisify(gunzip);

const cache = new Map<string, Promise<unknown>>();

function readGz<T>(file: string): Promise<T> {
  let p = cache.get(file);
  if (!p) {
    p = fs
      .readFile(file)
      .then((buf) => gunzipAsync(buf))
      .then((buf) => JSON.parse(buf.toString("utf8")));
    p.catch(() => cache.delete(file));
    // Keep the cache small — tafsir surah files can be several MB.
    if (cache.size > 40) cache.delete(cache.keys().next().value as string);
    cache.set(file, p);
  }
  return p as Promise<T>;
}

const SAFE = /^[a-z0-9.-]+$/;

export function isLocalTranslation(id: string) {
  return id.startsWith("m99.");
}

/** Arabic + one translation, from alquran.cloud or (for "m99." ids) this site's files. */
export async function getSurahWithAnyTranslation(surah: number, translationId: string) {
  if (!isLocalTranslation(translationId) || !SAFE.test(translationId)) return getSurahWithTranslation(surah, translationId);
  const list = await readGz<string[]>(path.join(ROOT, "translations", translationId, `${surah}.json.gz`));
  return getSurahArabicWith(surah, (ayah) => list[ayah - 1] ?? "");
}

export async function readLocalTafsir(slug: string, surah: number): Promise<{ ayah: number; text: string }[]> {
  if (!SAFE.test(slug)) return [];
  try {
    return await readGz(path.join(ROOT, "tafsir", slug, `${surah}.json.gz`));
  } catch (e) {
    // Surahs an edition doesn't cover have no file.
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}
