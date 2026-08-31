// Converts the per-chapter-file hadith export (hadith_data.zip, extracted to
// .tmp_hadith_extract/) into this site's existing hadith_data schema: one
// combined JSON per (book, language) under public/hadith_data/<slug>/<lang>.json,
// plus a regenerated public/hadith_data/books.json index. See src/lib/hadith.ts
// for the target shape.
//
// Source totals (collection.json, book.json "total_*" fields) are NOT
// trusted — several are stale/overstated versus what's actually on disk
// (e.g. Musannaf Ibn Abi Shaybah claims 41 books but only ships 1). Every
// count here is computed from the files actually found.
//
// Usage: node scripts/hadith-import/convert.mjs

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const EXTRACT_ROOT = join(process.cwd(), ".tmp_hadith_extract");
const OUT_ROOT = join(process.cwd(), "public", "hadith_data");

const LANGS = ["ara", "eng", "urd"];
const LANG_DIRECTION = { ara: "rtl", eng: "ltr", urd: "rtl", ben: "ltr", fra: "ltr", ind: "ltr", rus: "ltr", tur: "ltr" };
const LANG_LABEL = { ara: "Arabic", eng: "English", urd: "Urdu", ben: "Bengali", fra: "French", ind: "Indonesian", rus: "Russian", tur: "Turkish" };
const LANG_NATIVE = { ara: "العربية", eng: "English", urd: "اردو", ben: "বাংলা", fra: "Français", ind: "Bahasa Indonesia", rus: "Русский", tur: "Türkçe" };

// These 6 books previously had additional language editions (from an older
// fawazahmed0-sourced import) that this zip doesn't provide. Their JSON
// files are untouched on disk — just re-listing them here so they aren't
// silently dropped from books.json when this script regenerates it.
const LEGACY_EXTRA_LANGUAGES = {
  bukhari: ["ben", "fra", "ind", "rus", "tur"],
  muslim: ["ben", "fra", "ind", "rus", "tur"],
  abudawud: ["ben", "fra", "ind", "rus", "tur"],
  tirmidhi: ["ben", "ind", "tur"],
  nasai: ["ben", "fra", "ind", "tur"],
  ibnmajah: ["ben", "fra", "ind", "tur"],
};

// prerender: true keeps a book in generateStaticParams (full build-time SSG,
// same as today); false renders its chapters on demand at request time
// instead, to keep `next build` fast for the large newly-added collections.
const COLLECTIONS = [
  { folder: "Sahih Bukhari", slug: "bukhari", name: "Sahih al-Bukhari", author: "Imam Muhammad al-Bukhari", authorYear: "194-256 AH", prerender: true },
  { folder: "Sahih Muslim", slug: "muslim", name: "Sahih Muslim", author: "Imam Muslim ibn al-Hajjaj", authorYear: "206-261 AH", prerender: true },
  { folder: "Sunnan Abu Dawood", slug: "abudawud", name: "Sunan Abu Dawud", author: "Imam Abu Dawud as-Sijistani", authorYear: "202-275 AH", prerender: true },
  { folder: "Jam-e-Tirmazi", slug: "tirmidhi", name: "Jami at-Tirmidhi", author: "Imam Abu Isa at-Tirmidhi", authorYear: "209-279 AH", prerender: true },
  { folder: "Sunnan Nisai", slug: "nasai", name: "Sunan an-Nasai", author: "Imam Ahmad an-Nasai", authorYear: "215-303 AH", prerender: true },
  { folder: "Sunnan Ibn e Maja", slug: "ibnmajah", name: "Sunan Ibn Majah", author: "Imam Muhammad ibn Majah", authorYear: "209-273 AH", prerender: true },

  { folder: "Musnad Ahmad", slug: "musnad-ahmad", name: "Musnad Ahmad", author: "Imam Ahmad ibn Hanbal", authorYear: "164-241 AH", prerender: false },
  { folder: "Muwatta Imam Malik", slug: "muwatta-malik", name: "Muwatta Imam Malik", author: "Imam Malik ibn Anas", authorYear: "93-179 AH", prerender: false },
  { folder: "Mishkat al-Masabih", slug: "mishkat", name: "Mishkat al-Masabih", author: "Al-Khatib at-Tabrizi", authorYear: "d. 741 AH", prerender: false },
  { folder: "Al-Adab Al-Mufrad", slug: "adab-al-mufrad", name: "Al-Adab Al-Mufrad", author: "Imam Muhammad al-Bukhari", authorYear: "194-256 AH", prerender: false },
  { folder: "Al-Muajam al-Saghir Tabarani", slug: "mujam-saghir-tabarani", name: "Al-Mu'jam as-Saghir", author: "Imam Sulayman at-Tabarani", authorYear: "260-360 AH", prerender: false },
  { folder: "Al Mustadrak", slug: "mustadrak-hakim", name: "Al-Mustadrak ala as-Sahihain", author: "Imam al-Hakim an-Naysaburi", authorYear: "321-405 AH", prerender: false },
  { folder: "Sunan Al Kubra Bayhaqi", slug: "sunan-kubra-bayhaqi", name: "Sunan al-Kubra", author: "Imam Ahmad al-Bayhaqi", authorYear: "384-458 AH", prerender: false },
  { folder: "Sunan Darmi", slug: "sunan-darimi", name: "Sunan ad-Darimi", author: "Imam Abdullah ad-Darimi", authorYear: "181-255 AH", prerender: false },
  { folder: "Musannaf Ibn Abi Shaybah", slug: "musannaf-ibn-abi-shaybah", name: "Musannaf Ibn Abi Shaybah", author: "Imam Abu Bakr ibn Abi Shaybah", authorYear: "159-235 AH", prerender: false },
  { folder: "Shamail-E-Tirmazi", slug: "shamail-tirmidhi", name: "Shama'il al-Tirmidhi", author: "Imam Abu Isa at-Tirmidhi", authorYear: "209-279 AH", prerender: false },
  { folder: "Silsila Sahiha", slug: "silsila-sahiha", name: "Silsilat al-Ahadith as-Sahihah", author: "Sheikh Muhammad Nasiruddin al-Albani", authorYear: "1332-1420 AH", prerender: false },
  { folder: "Fatah Al-Rabani Musnad Ahmad Fiqhi", slug: "fath-al-rabbani", name: "Al-Fath ar-Rabbani (Musnad Ahmad, Fiqh Order)", author: "Ahmad Abd ar-Rahman al-Banna (as-Sa'ati)", authorYear: "1310-1378 AH", prerender: false },
];

function numFromPrefix(name, prefix) {
  const m = name.match(new RegExp(`^${prefix}(\\d+)`));
  return m ? Number(m[1]) : null;
}

async function listNumbered(dir, prefix, suffix = "") {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .map((e) => ({ e, n: numFromPrefix(e.name, prefix) }))
    .filter(({ e, n }) => n !== null && e.name.endsWith(suffix))
    .sort((a, b) => a.n - b.n)
    .map(({ e, n }) => ({ name: e.name, n }));
}

function pickChapterName(chap, lang) {
  const chain = lang === "eng" ? [chap.english, chap.urdu, chap.arabic] : lang === "urd" ? [chap.urdu, chap.english, chap.arabic] : [chap.arabic, chap.urdu, chap.english];
  return chain.find((s) => s && s.trim().length > 0) ?? `Chapter ${chap.number}`;
}

function pickHadithText(h, lang) {
  const text = lang === "ara" ? h.arabic_text : lang === "eng" ? h.english_translation : h.urdu_translation;
  if (text && text.trim().length > 0) return text.trim();
  return `(No ${LANG_LABEL[lang]} translation available for this hadith yet.)`;
}

async function convertCollection(col) {
  const collectionRoot = join(EXTRACT_ROOT, col.folder);
  const books = await listNumbered(join(collectionRoot, "books"), "Book_");

  const editions = Object.fromEntries(LANGS.map((l) => [l, { chapters: [], hadiths: [] }]));
  const coverage = Object.fromEntries(LANGS.map((l) => [l, 0]));
  let totalHadiths = 0;

  for (const bookEntry of books) {
    const bookDir = join(collectionRoot, "books", bookEntry.name);
    const chapterFiles = await listNumbered(join(bookDir, "chapters"), "chap_", ".json");

    for (const chapFile of chapterFiles) {
      let chap;
      try {
        chap = JSON.parse(await readFile(join(bookDir, "chapters", chapFile.name), "utf8"));
      } catch (err) {
        process.stdout.write(`  ! skipped unreadable ${col.folder}/${bookEntry.name}/${chapFile.name}: ${err.message}\n`);
        continue;
      }

      for (const lang of LANGS) {
        editions[lang].chapters.push({ number: chap.number, name: pickChapterName(chap, lang) });
      }

      const hadiths = Array.isArray(chap.hadiths) ? chap.hadiths : [];
      hadiths.forEach((h, i) => {
        totalHadiths++;
        const hadithNumber = h.hadith_number ?? totalHadiths;
        const arabicNumber = Number(h.reference?.international_number) || hadithNumber;
        const grades = h.status && h.status.trim() ? [{ name: "Grading", grade: h.status.trim() }] : [];
        const explanation = h.explanation && h.explanation.trim() ? h.explanation.trim() : undefined;
        const alternateTranslations =
          Array.isArray(h.urdu_translations) && h.urdu_translations.length > 0
            ? h.urdu_translations.filter((t) => t.text && t.text.trim()).map((t) => ({ translator: t.translator, text: t.text.trim() }))
            : undefined;

        if (h.arabic_text?.trim()) coverage.ara++;
        if (h.english_translation?.trim()) coverage.eng++;
        if (h.urdu_translation?.trim()) coverage.urd++;

        for (const lang of LANGS) {
          const base = {
            hadithNumber,
            arabicNumber,
            text: pickHadithText(h, lang),
            grades,
            chapterNumber: chap.number,
            hadithInChapter: i + 1,
          };
          if (explanation) base.explanation = explanation;
          if (alternateTranslations) base.alternateTranslations = alternateTranslations;
          editions[lang].hadiths.push(base);
        }
      });
    }
  }

  // Only keep a language edition (and list it as available) if it has
  // meaningful real coverage, not just placeholder text everywhere.
  const availableLangs = LANGS.filter((l) => coverage[l] / Math.max(totalHadiths, 1) > 0.05);
  if (availableLangs.length === 0) availableLangs.push("urd"); // always keep at least one edition

  const defaultLanguage = coverage.eng / Math.max(totalHadiths, 1) > 0.6 ? "eng" : availableLangs.includes("urd") ? "urd" : availableLangs[0];

  const outDir = join(OUT_ROOT, col.slug);
  await mkdir(outDir, { recursive: true });
  for (const lang of availableLangs) {
    const edition = {
      language: lang,
      direction: LANG_DIRECTION[lang],
      chapters: editions[lang].chapters,
      hadiths: editions[lang].hadiths,
    };
    await writeFile(join(outDir, `${lang}.json`), JSON.stringify(edition));
  }

  const allLangCodes = [...availableLangs, ...(LEGACY_EXTRA_LANGUAGES[col.slug] ?? [])];

  return {
    slug: col.slug,
    name: col.name,
    author: col.author,
    authorYear: col.authorYear,
    totalHadiths,
    prerender: col.prerender,
    defaultLanguage,
    languages: allLangCodes.map((code) => ({ code, name: LANG_LABEL[code], nativeName: LANG_NATIVE[code], direction: LANG_DIRECTION[code] })),
  };
}

async function main() {
  const books = [];
  for (const col of COLLECTIONS) {
    process.stdout.write(`Converting ${col.name} (${col.folder})... `);
    try {
      const summary = await convertCollection(col);
      books.push(summary);
      process.stdout.write(`${summary.totalHadiths} hadiths, languages: ${summary.languages.map((l) => l.code).join(",")}, default: ${summary.defaultLanguage}\n`);
    } catch (err) {
      process.stdout.write(`FAILED: ${err.stack}\n`);
    }
  }

  await mkdir(OUT_ROOT, { recursive: true });
  await writeFile(join(OUT_ROOT, "books.json"), JSON.stringify(books, null, 2));
  process.stdout.write(`\nWrote books.json with ${books.length} collections.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
