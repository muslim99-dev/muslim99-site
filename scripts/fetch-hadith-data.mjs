// Fetches the 6 core hadith collections (all available native-language
// editions) from fawazahmed0/hadith-api and stores them as static JSON —
// same "no database, static data generated once" pattern as the Quran
// section. Re-running is safe (overwrites with fresh data; the API content
// is stable/versioned so this is mainly for initial setup or updates).
//
// Writes:
//   public/hadith_data/books.json                -> book summary index
//   public/hadith_data/<book>/<langCode>.json     -> full edition (metadata + hadiths)

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const API_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const ROOT = join(process.cwd(), "public", "hadith_data");

// Canonical info for the 6 books — the API's own `author`/`name` fields are
// often "Unknown" or terse, so these are supplied directly (well-established,
// uncontroversial facts about these classical collections).
const BOOKS = [
  { slug: "bukhari", editionBook: "bukhari", name: "Sahih al-Bukhari", author: "Imam Muhammad al-Bukhari", authorYear: "194-256 AH" },
  { slug: "muslim", editionBook: "muslim", name: "Sahih Muslim", author: "Imam Muslim ibn al-Hajjaj", authorYear: "206-261 AH" },
  { slug: "abudawud", editionBook: "abudawud", name: "Sunan Abu Dawud", author: "Imam Abu Dawud as-Sijistani", authorYear: "202-275 AH" },
  { slug: "tirmidhi", editionBook: "tirmidhi", name: "Jami at-Tirmidhi", author: "Imam Abu Isa at-Tirmidhi", authorYear: "209-279 AH" },
  { slug: "nasai", editionBook: "nasai", name: "Sunan an-Nasai", author: "Imam Ahmad an-Nasai", authorYear: "215-303 AH" },
  { slug: "ibnmajah", editionBook: "ibnmajah", name: "Sunan Ibn Majah", author: "Imam Muhammad ibn Majah", authorYear: "209-273 AH" },
];

// code -> API edition-name language prefix + display info
const LANGUAGES = [
  { code: "ara", prefix: "ara", name: "Arabic", nativeName: "العربية", direction: "rtl" },
  { code: "eng", prefix: "eng", name: "English", nativeName: "English", direction: "ltr" },
  { code: "urd", prefix: "urd", name: "Urdu", nativeName: "اردو", direction: "rtl" },
  { code: "ben", prefix: "ben", name: "Bengali", nativeName: "বাংলা", direction: "ltr" },
  { code: "fra", prefix: "fra", name: "French", nativeName: "Français", direction: "ltr" },
  { code: "ind", prefix: "ind", name: "Indonesian", nativeName: "Bahasa Indonesia", direction: "ltr" },
  { code: "rus", prefix: "rus", name: "Russian", nativeName: "Русский", direction: "ltr" },
  { code: "tur", prefix: "tur", name: "Turkish", nativeName: "Türkçe", direction: "ltr" },
];

async function fetchJson(url, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null; // edition doesn't exist for this book
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 700 * attempt));
    }
  }
}

async function main() {
  await mkdir(ROOT, { recursive: true });
  const booksSummary = [];

  for (const book of BOOKS) {
    process.stdout.write(`\n=== ${book.name} (${book.slug}) ===\n`);
    await mkdir(join(ROOT, book.slug), { recursive: true });

    const availableLanguages = [];
    let totalHadiths = 0;

    for (const lang of LANGUAGES) {
      const editionName = `${lang.prefix}-${book.editionBook}`;
      const url = `${API_BASE}/${editionName}.min.json`;
      const data = await fetchJson(url);

      if (!data || !Array.isArray(data.hadiths) || data.hadiths.length === 0) {
        process.stdout.write(`  ${lang.code}: not available, skipped\n`);
        continue;
      }

      const chapters = Object.entries(data.metadata.sections ?? {})
        .filter(([num, name]) => num !== "0" && name)
        .map(([num, name]) => ({ number: Number(num), name }))
        .sort((a, b) => a.number - b.number);

      const filePath = join(ROOT, book.slug, `${lang.code}.json`);
      await writeFile(
        filePath,
        JSON.stringify({
          language: lang.code,
          direction: lang.direction,
          chapters,
          hadiths: data.hadiths.map((h) => ({
            hadithNumber: h.hadithnumber,
            arabicNumber: h.arabicnumber,
            text: h.text,
            grades: h.grades ?? [],
            chapterNumber: h.reference?.book ?? null,
            hadithInChapter: h.reference?.hadith ?? null,
          })),
        }),
        "utf8"
      );

      availableLanguages.push({ ...lang });
      if (lang.code === "eng" || (availableLanguages.length === 1)) totalHadiths = data.hadiths.length;
      process.stdout.write(`  ${lang.code}: ${data.hadiths.length} hadiths saved\n`);
    }

    booksSummary.push({
      slug: book.slug,
      name: book.name,
      author: book.author,
      authorYear: book.authorYear,
      totalHadiths,
      languages: availableLanguages,
    });
  }

  await writeFile(join(ROOT, "books.json"), JSON.stringify(booksSummary, null, 2), "utf8");
  process.stdout.write(`\nWrote books.json with ${booksSummary.length} books.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
