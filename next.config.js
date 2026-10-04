/** @type {import('next').NextConfig} */
const fs = require("node:fs");
const path = require("node:path");

// Hadith pages read the gzipped files in data/hadith_index at runtime (built
// from data/hadith_data by scripts/build-hadith-index.mjs). The raw dataset
// is ~430 MB and must never be bundled into a serverless function (Vercel's
// limit is 250 MB), so it's excluded everywhere and each route gets only the
// index files it actually reads.
const manifest = "data/hadith_index/manifest.json.gz";
const search = "data/hadith_index/search/**";
const chapters = "data/hadith_index/chapters/**";

// The 18 original collections (data/hadith_data). The Ask assistant searches
// only these — with the 19 imported ones (data/hadith_extra) its function
// would exceed the 250 MB limit.
const ORIGINAL = fs
  .readdirSync(path.join(__dirname, "data", "hadith_data"))
  .filter((d) => fs.statSync(path.join(__dirname, "data", "hadith_data", d)).isDirectory())
  .map((d) => d.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
const originalSearch = ORIGINAL.map((s) => `data/hadith_index/search/${s}.json.gz`);
const originalChapters = ORIGINAL.map((s) => `data/hadith_index/chapters/${s}/**`);

// Translations and Urdu tafsirs extracted from quran.db (scripts/build-quran-db.mjs).
const qdbTranslations = "data/quran_db/translations/**";
const qdbTafsir = "data/quran_db/tafsir/**";

const nextConfig = {
  // Lets a local production build go to another folder (NEXT_DIST_DIR) so it
  // doesn't clash with a running dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": ["data/hadith_data/**", "data/hadith_extra/**", "hadith_data.zip", "quran.db"]
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
      "/api/ask": [manifest, ...originalSearch, ...originalChapters],
      "/quran/[surah]": [qdbTranslations],
      "/tafsir/[surah]": [qdbTafsir],
      "/api/tafsir-search": [qdbTafsir]
    }
  }
};

module.exports = nextConfig;
