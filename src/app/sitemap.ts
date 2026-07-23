import { SITE_CONFIG } from "@/constants/site";
import { MetadataRoute } from "next";

const TOTAL_SURAHS = 114;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const surahRoutes: MetadataRoute.Sitemap = Array.from({ length: TOTAL_SURAHS }, (_, i) => ({
    url: `${SITE_CONFIG.url}/quran/${i + 1}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
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
