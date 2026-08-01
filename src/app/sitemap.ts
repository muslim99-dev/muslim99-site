import { SITE_CONFIG } from "@/constants/site";
import { MetadataRoute } from "next";

const TOTAL_SURAHS = 114;

// Fixed, known-stable chapter counts per book — hardcoded (rather than read
// from public/hadith_data at build time) to avoid the file-tracing bloat a
// filesystem read here would cause across ~44 multi-MB data files.
const HADITH_BOOK_CHAPTER_COUNTS: Record<string, number> = {
  bukhari: 97,
  muslim: 56,
  abudawud: 43,
  tirmidhi: 49,
  nasai: 51,
  ibnmajah: 37,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const surahRoutes: MetadataRoute.Sitemap = Array.from({ length: TOTAL_SURAHS }, (_, i) => ({
    url: `${SITE_CONFIG.url}/quran/${i + 1}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const hadithRoutes: MetadataRoute.Sitemap = Object.entries(HADITH_BOOK_CHAPTER_COUNTS).flatMap(([slug, chapterCount]) => [
    {
      url: `${SITE_CONFIG.url}/hadith/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...Array.from({ length: chapterCount }, (_, i) => ({
      url: `${SITE_CONFIG.url}/hadith/${slug}/${i + 1}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ]);

  return [
    {
      url: SITE_CONFIG.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}/quran`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...surahRoutes,
    {
      url: `${SITE_CONFIG.url}/hadith`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...hadithRoutes,
    {
      url: `${SITE_CONFIG.url}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_CONFIG.url}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
