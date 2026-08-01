// Fetches additional-language Quran translations from the Al-Quran Cloud API
// (api.alquran.cloud) and merges them into the existing per-verse
// translations.json files (public/quran_data/Surah_<n>/verses/<v>/translations.json),
// using the exact same {language, translator, text} shape already used for
// the Urdu/English/Hindi entries extracted from the source zip. This means
// no new UI plumbing is needed — the existing "Translations" tab and its
// language filter already render whatever languages are present.
//
// Verse-number mapping (verified against the live API before writing this):
//   - Surah 1: the API's ayah numberInSurah=1 is the Bismillah, which is
//     numberInSurah-1 in our indexing (our verse 0 = Bismillah).
//   - Every other surah: numberInSurah maps 1:1 to our verse number (the
//     API's per-surah ayah list never includes the Bismillah preface).
//
// Idempotent: re-running skips any (language, translator) pair already
// present for a given verse, so it's safe to re-run after adding editions.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", "quran_data");
const API_BASE = "https://api.alquran.cloud/v1";

const EDITIONS = [
  { identifier: "zh.jian", language: "Chinese", translator: "Ma Jian" },
  { identifier: "de.bubenheim", language: "German", translator: "Bubenheim & Elyas" },
  { identifier: "fa.fooladvand", language: "Persian", translator: "Mohammad Mahdi Fooladvand" },
  { identifier: "ps.abdulwali", language: "Pashto", translator: "Abdul Wali" },
];

async function fetchJson(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

function mapToOurVerseNumber(surahNumber, numberInSurah) {
  if (surahNumber === 1) return numberInSurah - 1;
  return numberInSurah;
}

async function main() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const surahDirs = entries
    .filter((e) => e.isDirectory() && /^Surah_\d+$/.test(e.name))
    .map((e) => Number(e.name.slice(6)))
    .sort((a, b) => a - b);

  const CONCURRENCY = 6;

  for (const edition of EDITIONS) {
    process.stdout.write(`\n=== ${edition.language} (${edition.translator}) ===\n`);
    let addedCount = 0;
    let skippedCount = 0;
    let doneCount = 0;

    async function processSurah(surahNumber) {
      const data = await fetchJson(`${API_BASE}/surah/${surahNumber}/${edition.identifier}`);
      const ayahs = data.data.ayahs;

      for (const ayah of ayahs) {
        const verseNumber = mapToOurVerseNumber(surahNumber, ayah.numberInSurah);
        const filePath = join(ROOT, `Surah_${surahNumber}`, "verses", String(verseNumber), "translations.json");

        let translations;
        try {
          translations = JSON.parse(await readFile(filePath, "utf8"));
        } catch {
          // No translations.json for this verse (shouldn't normally happen) — skip.
          continue;
        }

        const already = translations.some(
          (t) => t.language === edition.language && t.translator === edition.translator
        );
        if (already) {
          skippedCount++;
          continue;
        }

        translations.push({ language: edition.language, translator: edition.translator, text: ayah.text });
        await writeFile(filePath, JSON.stringify(translations, null, 2), "utf8");
        addedCount++;
      }

      doneCount++;
      process.stdout.write(`  ${doneCount}/${surahDirs.length} surahs done\r`);
    }

    const queue = [...surahDirs];
    async function worker() {
      while (queue.length > 0) {
        const surahNumber = queue.shift();
        if (surahNumber === undefined) break;
        await processSurah(surahNumber);
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    process.stdout.write(`\n  Added ${addedCount} verses, skipped ${skippedCount} already present.\n`);
  }

  process.stdout.write("\nAll editions processed.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
