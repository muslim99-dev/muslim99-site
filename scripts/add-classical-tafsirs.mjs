// One-off import: adds a curated set of classical/public-domain tafsirs
// (plus a few altafsir.com/Royal Aal al-Bayt Institute English translations
// known to be openly licensed for reuse) to every verse's tafaseers.json.
// Source: a local ./tafsir/<edition-slug>/<surah>.json copy of the
// spa5k/tafsir_api dataset (itself sourced from QUL — Tarteel's Quranic
// Universal Library, and altafsir.com).
//
// Deliberately excludes: anything by an author who died after ~1900, any
// translation whose license isn't independently verifiable, and modern
// institutional works (e.g. Al-Mukhtasar and its ~25 language editions)
// without confirmed redistribution terms. Safe to re-run — skips verses
// that already have a given entry.

import fs from "node:fs/promises";
import path from "node:path";

const TAFSIR_ROOT = path.join(process.cwd(), "tafsir");
const DATA_ROOT = path.join(process.cwd(), "public", "quran_data");
const TOTAL_SURAHS = 114;

// slug (matches the local ./tafsir/<slug> folder) -> display metadata.
const EDITIONS = [
  { slug: "ar-tafsir-ibn-kathir", name: "Tafsir Ibn Kathir (Arabic)", author: "Hafiz Ibn Kathir", language: "Arabic" },
  { slug: "ar-tafsir-al-baghawi", name: "Tafsir al-Baghawi", author: "Al-Baghawi", language: "Arabic" },
  { slug: "ar-tafseer-al-qurtubi", name: "Tafsir al-Qurtubi", author: "Al-Qurtubi", language: "Arabic" },
  { slug: "ar-tafsir-al-jalalayn", name: "Tafsir al-Jalalayn (Arabic)", author: "Al-Mahalli & As-Suyuti", language: "Arabic" },
  { slug: "ar-tafsir-al-wasit", name: "Tafsir al-Wasit", author: "Al-Wahidi", language: "Arabic" },
  { slug: "tafsir-abi-al-su-ood", name: "Tafsir Abi al-Su'ud", author: "Abu al-Su'ud", language: "Arabic" },
  { slug: "tafsir-al-alusi", name: "Ruh al-Ma'ani", author: "Al-Alusi", language: "Arabic" },
  { slug: "tafsir-al-baydawi", name: "Tafsir al-Baydawi", author: "Al-Baydawi", language: "Arabic" },
  { slug: "tafsir-al-mawardi", name: "An-Nukat wal-Uyun", author: "Al-Mawardi", language: "Arabic" },
  { slug: "tafsir-al-nasafi", name: "Madarik al-Tanzil", author: "An-Nasafi", language: "Arabic" },
  { slug: "tafsir-al-razi", name: "Mafatih al-Ghayb", author: "Fakhr al-Din al-Razi", language: "Arabic" },
  { slug: "tafsir-al-sam-ani", name: "Tafsir al-Sam'ani", author: "As-Sam'ani", language: "Arabic" },
  { slug: "tafsir-al-samarqandi", name: "Bahr al-Ulum", author: "As-Samarqandi", language: "Arabic" },
  { slug: "tafsir-ibn-abi-hatim", name: "Tafsir Ibn Abi Hatim", author: "Ibn Abi Hatim", language: "Arabic" },
  { slug: "tafsir-ibn-abi-zamanin", name: "Tafsir Ibn Abi Zamanin", author: "Ibn Abi Zamanin", language: "Arabic" },
  { slug: "tafsir-ibn-al-jawzi", name: "Zad al-Masir", author: "Ibn al-Jawzi", language: "Arabic" },
  { slug: "tafsir-ibn-al-qayyim", name: "Tafsir Ibn al-Qayyim", author: "Ibn al-Qayyim al-Jawziyyah", language: "Arabic" },
  { slug: "tafsir-ibn-juzay", name: "At-Tashil", author: "Ibn Juzayy", language: "Arabic" },
  { slug: "tafsir-makhi", name: "Al-Hidayah ila Bulugh al-Nihayah", author: "Makki ibn Abi Talib", language: "Arabic" },
  { slug: "ar-tafseer-tanwir-al-miqbas", name: "Tanwir al-Miqbas (Arabic)", author: "attrib. Ibn Abbas, comp. Al-Fayruzabadi", language: "Arabic" },
  { slug: "al-kashshaf-al-zamakhshari", name: "Al-Kashshaf", author: "Al-Zamakhshari", language: "Arabic" },
  { slug: "al-durr-al-manthur", name: "Al-Durr al-Manthur", author: "As-Suyuti", language: "Arabic" },
  { slug: "al-muharrar-al-wajiz-ibn-atiyyah", name: "Al-Muharrar al-Wajiz", author: "Ibn Atiyyah", language: "Arabic" },
  { slug: "fath-al-qadir-al-shawkani", name: "Fath al-Qadir", author: "Ash-Shawkani", language: "Arabic" },
  { slug: "nazam-al-durar-al-biqa-i", name: "Nazam al-Durar", author: "Al-Biqa'i", language: "Arabic" },
  { slug: "al-basit", name: "Al-Basit", author: "Al-Wahidi", language: "Arabic" },
  { slug: "al-wajiz-wahidi", name: "Al-Wajiz", author: "Al-Wahidi", language: "Arabic" },
  { slug: "al-bahr-al-muhit", name: "Al-Bahr al-Muhit", author: "Abu Hayyan al-Gharnati", language: "Arabic" },
  { slug: "al-dur-al-masun-lil-samin-al-halabi", name: "Al-Durr al-Masun", author: "As-Samin al-Halabi", language: "Arabic" },
  { slug: "ar-tafseer-al-saddi", name: "Tafsir al-Suddi", author: "Al-Suddi", language: "Arabic" },
  { slug: "ar-tafsir-al-tha-alibi", name: "Al-Jawahir al-Hisan", author: "Al-Tha'alibi", language: "Arabic" },
  { slug: "al-lubab-fi-ulum-al-kitab", name: "Al-Lubab fi Ulum al-Kitab", author: "Ibn Adil al-Hanbali", language: "Arabic" },
  { slug: "fath-al-bayan-li-al-qanuji", name: "Fath al-Bayan fi Maqasid al-Qur'an", author: "Siddiq Hasan Khan al-Qannauji", language: "Arabic" },
  // Note: the altafsir.com English translations (Ibn Abbas/Tanwir al-Miqbas,
  // Al-Qushayri, Kashani, Kashf al-Asrar, Al-Tustari) are deliberately left
  // out of this batch — a translation is its own separate copyrightable
  // work regardless of the original's age, and their license terms haven't
  // been independently verified here.
];

async function mergeVerse(surahNumber, ayah, entry) {
  const dir = path.join(DATA_ROOT, `Surah_${surahNumber}`, "verses", String(ayah));
  const file = path.join(dir, "tafaseers.json");

  let arr = [];
  try {
    arr = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    // no existing tafaseers.json for this verse yet — start fresh
  }

  if (arr.some((e) => e.name === entry.name)) return false; // already merged

  arr.push({ name: entry.name, author: entry.author, language: entry.language, text: entry.text.trim() });
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
  return true;
}

async function run() {
  for (const edition of EDITIONS) {
    let merged = 0;
    let totalVerses = 0;
    let editionFailed = false;

    for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
      const file = path.join(TAFSIR_ROOT, edition.slug, `${surah}.json`);
      let verses;
      try {
        const raw = JSON.parse(await fs.readFile(file, "utf8"));
        // Most editions are a plain array; a few (e.g. Tanwir al-Miqbas)
        // wrap it as { ayahs: [...] }.
        verses = Array.isArray(raw) ? raw : Array.isArray(raw?.ayahs) ? raw.ayahs : [];
      } catch (err) {
        console.error(`  [${edition.slug}] surah ${surah}: ${err.code === "ENOENT" ? "missing file" : err.message}`);
        editionFailed = true;
        continue;
      }
      for (const v of verses) {
        if (!v.text || !v.text.trim()) continue;
        totalVerses++;
        const didMerge = await mergeVerse(surah, v.ayah, { ...edition, text: v.text });
        if (didMerge) merged++;
      }
    }

    console.log(`${edition.name} (${edition.slug}): ${merged}/${totalVerses} verses merged${editionFailed ? " — some surah files were missing" : ""}`);
  }

  console.log("\nDone.");
}

run();
