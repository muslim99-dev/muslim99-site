/** @type {import('next').NextConfig} */

// Hadith pages read the gzipped files in data/hadith_index at runtime (built
// from data/hadith_data by scripts/build-hadith-index.mjs). The raw dataset
// is ~430 MB and must never be bundled into a serverless function (Vercel's
// limit is 250 MB), so it's excluded everywhere and each route gets only the
// index files it actually reads.
const manifest = "data/hadith_index/manifest.json.gz";
const search = "data/hadith_index/search/**";
const chapters = "data/hadith_index/chapters/**";

// Translations and Urdu tafsirs extracted from quran.db (scripts/build-quran-db.mjs).
const qdbTranslations = "data/quran_db/translations/**";
const qdbTafsir = "data/quran_db/tafsir/**";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": ["data/hadith_data/**", "hadith_data.zip", "quran.db"]
    },
    outputFileTracingIncludes: {
      "/hadith": [manifest],
      "/hadith/[book]": [manifest],
      "/hadith/[book]/[bookNum]": [manifest],
      "/hadith/[book]/[bookNum]/[chapter]": [manifest, chapters],
      "/api/hadith-search": [manifest, search],
      "/api/hadith-lookup": [manifest, chapters],
      "/hadith/saved": [manifest],
      "/sitemap.xml": [manifest],
      "/": [manifest],
      "/api/ask": [manifest, search, chapters],
      "/quran/[surah]": [qdbTranslations],
      "/tafsir/[surah]": [qdbTafsir],
      "/api/tafsir-search": [qdbTafsir]
    }
  }
};

module.exports = nextConfig;
