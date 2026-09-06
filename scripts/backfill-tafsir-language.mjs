// Backfills the `language` field on tafaseers.json entries that predate it
// (the site's original Urdu set, plus Tafsir al-Tabari) so the language
// filter in the UI has consistent metadata to work with. Safe to re-run.

import fs from "node:fs/promises";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "public", "quran_data");
const TOTAL_SURAHS = 114;

const LANGUAGE_BY_NAME = {
  "Tafseer Ibn-e-Kaseer": "Urdu",
  "Ahsan ul Bayan": "Urdu",
  "Taiseer ul Quran": "Urdu",
  "Tafseer al Quran": "Urdu",
  "Maariful Quran": "Urdu",
  "Mufradat ul Quran": "Urdu",
  "Ahkam ul Quran": "Urdu",
  "Tafseer Ibn e Abbas": "Urdu",
  "Bayan ul Quran": "Urdu",
  "Tafheem ul Quran": "Urdu",
  "Aasan Tarjuma e Quran": "Urdu",
  "Tafsir al-Tabari": "Arabic",
};

async function run() {
  let updated = 0;
  for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
    const versesDir = path.join(DATA_ROOT, `Surah_${surah}`, "verses");
    let verseDirs;
    try {
      verseDirs = await fs.readdir(versesDir);
    } catch {
      continue;
    }
    for (const v of verseDirs) {
      const file = path.join(versesDir, v, "tafaseers.json");
      let arr;
      try {
        arr = JSON.parse(await fs.readFile(file, "utf8"));
      } catch {
        continue;
      }
      let changed = false;
      for (const entry of arr) {
        if (!entry.language && LANGUAGE_BY_NAME[entry.name]) {
          entry.language = LANGUAGE_BY_NAME[entry.name];
          changed = true;
        }
      }
      if (changed) {
        await fs.writeFile(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
        updated++;
      }
    }
  }
  console.log(`Backfilled language on ${updated} verse files.`);
}

run();
