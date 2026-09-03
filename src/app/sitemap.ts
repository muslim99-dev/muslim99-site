import { SITE_CONFIG } from "@/constants/site";
import { MetadataRoute } from "next";

const TOTAL_SURAHS = 114;

// The 18 hadith collection slugs — hardcoded (rather than read from
// public/hadith_data at build time) to avoid the file-tracing bloat a
// filesystem read here would cause across ~44 multi-MB data files. Only the
// collection-level URL is listed; books/chapters are reachable from there
// and are too numerous (and too deep, given the Kitab → Bab → Hadith
// structure) to enumerate here.
const HADITH_COLLECTION_SLUGS = [
  "bukhari",
  "muslim",
  "abudawud",
  "tirmidhi",
  "nasai",
  "ibnmajah",
  "musnad-ahmad",
  "muwatta-malik",
  "mishkat",
  "adab-al-mufrad",
  "mujam-saghir-tabarani",
  "mustadrak-hakim",
  "sunan-kubra-bayhaqi",
  "sunan-darimi",
  "musannaf-ibn-abi-shaybah",
  "shamail-tirmidhi",
  "silsila-sahiha",
  "fath-al-rabbani",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const surahRoutes: MetadataRoute.Sitemap = Array.from({ length: TOTAL_SURAHS }, (_, i) => ({
    url: `${SITE_CONFIG.url}/quran/${i + 1}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const hadithRoutes: MetadataRoute.Sitemap = HADITH_COLLECTION_SLUGS.map((slug) => ({
    url: `${SITE_CONFIG.url}/hadith/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

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
