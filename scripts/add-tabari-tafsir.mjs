// One-off import: adds the complete Tafsir al-Tabari (classical Arabic,
// Ibn Jarir al-Tabari) to every verse's tafaseers.json, sourced from the
// spa5k/tafsir_api project (MIT licensed, itself sourced from QUL —
// Tarteel's Quranic Universal Library — the same dataset quran.com uses).
// Safe to re-run: skips verses that already have this entry.

import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/ar-tafsir-al-tabari";
const ENTRY_NAME = "Tafsir al-Tabari";
const ENTRY_AUTHOR = "Ibn Jarir al-Tabari";
const TOTAL_SURAHS = 114;
const DATA_ROOT = path.join(process.cwd(), "public", "quran_data");

async function fetchSurah(surahNumber) {
  const res = await fetch(`${BASE}/${surahNumber}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function mergeVerse(surahNumber, ayah, text) {
  const dir = path.join(DATA_ROOT, `Surah_${surahNumber}`, "verses", String(ayah));
  const file = path.join(dir, "tafaseers.json");

  let arr = [];
  try {
    arr = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    // no existing tafaseers.json for this verse yet — start fresh
  }

  if (arr.some((e) => e.name === ENTRY_NAME)) return false; // already merged

  arr.push({ name: ENTRY_NAME, author: ENTRY_AUTHOR, text: text.trim() });
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
  return true;
}

async function run() {
  let totalMerged = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
    let verses;
    try {
      verses = await fetchSurah(surah);
    } catch (err) {
      console.error(`Surah ${surah}: failed to fetch — ${err.message}`);
      totalFailed++;
      continue;
    }

    let merged = 0;
    for (const v of verses) {
      if (!v.text || !v.text.trim()) continue;
      const didMerge = await mergeVerse(surah, v.ayah, v.text);
      if (didMerge) merged++;
      else totalSkipped++;
    }
    totalMerged += merged;
    console.log(`Surah ${surah}: ${merged}/${verses.length} verses merged`);
  }

  console.log(`\nDone. Merged ${totalMerged}, already present ${totalSkipped}, failed surahs ${totalFailed}.`);
}

run();
