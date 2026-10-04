import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_SECTIONS } from "@/lib/site";
import { getBooks, getCollections } from "@/lib/hadith";
import { TAFSIRS } from "@/lib/tafsir";
import { getDuaCategories } from "@/lib/duas";

export const revalidate = 86400;

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: Entry["changeFrequency"] = "weekly"): Entry => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority
  });

  const surahs = Array.from({ length: 114 }, (_, i) => i + 1);

  const hadith: Entry[] = [];
  try {
    for (const c of await getCollections()) {
      hadith.push(entry(`/hadith/${c.slug}`, 0.8));
      for (const b of await getBooks(c.slug)) hadith.push(entry(`/hadith/${c.slug}/${b.number}`, 0.6, "monthly"));
    }
  } catch {
    // hadith index unavailable — the section pages are still listed
  }

  return [
    entry("/", 1, "daily"),
    ...SITE_SECTIONS.map((s) => entry(s.path, 0.9, "daily")),
    entry("/about", 0.6, "monthly"),
    entry("/contact", 0.3, "yearly"),
    entry("/download-app", 0.7, "monthly"),
    entry("/privacy", 0.2, "yearly"),
    entry("/terms", 0.2, "yearly"),
    ...surahs.map((n) => entry(`/quran/${n}`, 0.8, "monthly")),
    ...surahs.map((n) => entry(`/tafsir/${n}`, 0.7, "monthly")),
    ...TAFSIRS.map((t) => entry(`/tafsir/edition/${t.slug}`, 0.6, "monthly")),
    ...hadith,
    ...getDuaCategories().map((c) => entry(`/duas/${c.slug}`, 0.7, "monthly"))
  ];
}
