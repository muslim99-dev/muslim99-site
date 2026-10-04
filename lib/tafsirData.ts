/**
 * Server-side tafsir fetchers. Editions come from the Muslim99 tafsir API
 * (TAFSIR_API_URL) or, for `local` editions, from data/quran_db
 * (lib/quranDb.ts). The edition catalogue itself is in lib/tafsir.ts.
 */
import localCatalogue from "@/data/quran_db/meta.json";
import { getTafsir } from "./tafsir";
import { readLocalTafsir } from "./quranDb";

const API = (process.env.TAFSIR_API_URL || "https://gold-owl-974382.hostingersite.com").replace(/\/$/, "");
const DAY = 86400;

const isLocal = (slug: string) => !!getTafsir(slug)?.local;

async function getJSON<T>(path: string, revalidate = DAY): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`Tafsir API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export type TafsirAyah = { ayah: number; text: string };

export async function getTafsirForSurah(slug: string, surahNumber: number): Promise<TafsirAyah[]> {
  if (isLocal(slug)) return readLocalTafsir(slug, surahNumber);
  const raw = await getJSON<{ ayahs: unknown }>(`/api/editions/${slug}/surahs/${surahNumber}`);
  // Most editions return { ayahs: [...] }; a few nest it as { ayahs: { ayahs: [...] } }.
  const list = Array.isArray(raw.ayahs) ? raw.ayahs : (raw.ayahs as { ayahs?: unknown[] })?.ayahs ?? [];
  return (list as { ayah: number; text: string }[])
    .filter((v) => typeof v.ayah === "number" && v.text && v.text.trim().length > 0)
    .map((v) => ({ ayah: v.ayah, text: v.text }));
}

export type SurahCoverage = { number: number; withTafsir: number | null };

/** Which surahs an edition covers, with how many ayahs have their own commentary. */
export async function getEditionCoverage(slug: string): Promise<SurahCoverage[]> {
  const local = localCatalogue.tafsirs.find((t) => t.slug === slug);
  if (local) return local.coverage.map(([number, withTafsir]) => ({ number, withTafsir }));
  const data = await getJSON<{ surahs: { number: number; ayahs_with_tafsir: number | null }[] }>(
    `/api/editions/${slug}/surahs`
  );
  return data.surahs.map((s) => ({ number: s.number, withTafsir: s.ayahs_with_tafsir }));
}

export type TafsirSearchResult = { surah: number; ayah: number; snippet: string };

/** Case-insensitive substring search through a local edition's files. */
async function searchLocal(
  slug: string,
  query: string,
  { surah, limit = 20, offset = 0 }: { surah?: number; limit?: number; offset?: number }
) {
  const needle = query.toLocaleLowerCase();
  const surahs = surah ? [surah] : Array.from({ length: 114 }, (_, i) => i + 1);
  const results: TafsirSearchResult[] = [];
  let count = 0;
  for (const s of surahs) {
    for (const { ayah, text } of await readLocalTafsir(slug, s)) {
      const at = text.toLocaleLowerCase().indexOf(needle);
      if (at < 0) continue;
      if (count >= offset && results.length < limit) {
        const from = Math.max(0, at - 120);
        const snippet = (from > 0 ? "…" : "") + text.slice(from, at + needle.length + 200).trim() + "…";
        results.push({ surah: s, ayah, snippet });
      }
      count++;
    }
  }
  return { count, results };
}

export async function searchTafsir(
  slug: string,
  query: string,
  options?: { surah?: number; limit?: number; offset?: number }
): Promise<{ count: number; results: TafsirSearchResult[] }> {
  if (isLocal(slug)) return searchLocal(slug, query, options ?? {});
  const params = new URLSearchParams({ edition: slug, q: query, limit: String(options?.limit ?? 20) });
  if (options?.surah) params.set("surah", String(options.surah));
  if (options?.offset) params.set("offset", String(options.offset));
  const data = await getJSON<{ count: number; results: TafsirSearchResult[] }>(`/api/search?${params}`, 600);
  return { count: data.count, results: data.results.map(({ surah, ayah, snippet }) => ({ surah, ayah, snippet })) };
}
