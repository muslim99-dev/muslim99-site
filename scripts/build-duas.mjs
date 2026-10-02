/**
 * Generates data/duas.json — the Duas section's content — from two
 * referenced sources. Nothing here is written by hand except which Quran
 * verses count as supplications; all text comes from the sources:
 *
 * 1. Hisn al-Muslim (Fortress of the Muslim, Sa'id al-Qahtani) from the
 *    muslim-data project's database (Apache-2.0,
 *    github.com/my-prayers/muslim-data-android): Arabic text, English,
 *    Persian and Russian translations, and the hadith reference for each.
 *    Urdu comes from data/duas-urdu/*.json, keyed by dua number: no
 *    published Urdu Hisn al-Muslim is available in a reusable form, so
 *    these are AI-assisted translations from the Arabic (flagged as such
 *    on the site). Entries that are Qur'an passages are given as verse
 *    references instead and use the published Jalandhry Urdu translation.
 * 2. Supplications from the Qur'an via api.alquran.cloud: Uthmani text,
 *    transliteration, two English and two Urdu translations, with the
 *    surah:ayah reference.
 *
 * Usage:  node scripts/build-duas.mjs [path/to/muslim_db.db]
 * (downloads the database if no path is given)
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_URL =
  "https://github.com/my-prayers/muslim-data-android/raw/main/muslim-data/src/main/assets/database/muslim_db_v2.5.1.db";
const QURAN_API = "https://api.alquran.cloud/v1";
const OUT = path.join(process.cwd(), "data", "duas.json");

// ---------------------------------------------------------------- Hisn al-Muslim

async function loadDbPath() {
  if (process.argv[2]) return process.argv[2];
  const file = path.join(os.tmpdir(), "muslim_db_v2.5.1.db");
  if (!fs.existsSync(file)) {
    console.log("Downloading muslim-data database…");
    const res = await fetch(DB_URL);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

function buildHisn(dbPath) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const rows = (sql) => db.prepare(sql).all();
  const byLang = (table, idCol, textCol) => {
    const map = new Map();
    for (const r of rows(`SELECT ${idCol} AS id, language, ${textCol} AS text FROM ${table}`)) {
      if (!map.has(r.id)) map.set(r.id, {});
      map.get(r.id)[r.language] = (r.text || "").trim();
    }
    return map;
  };

  const categoryNames = byLang("azkar_category_translation", "category_id", "category_name");
  const chapterNames = byLang("azkar_chapter_translation", "chapter_id", "chapter_name");
  const itemText = byLang("azkar_item_translation", "item_id", "item_translation");
  const referenceText = byLang("azkar_reference_translation", "reference_id", "reference");
  const referenceIdByItem = new Map(rows("SELECT _id, item_id FROM azkar_reference").map((r) => [r.item_id, r._id]));

  const categories = rows("SELECT _id FROM azkar_category ORDER BY _id").map((c) => ({
    id: `hisn-${c._id}`,
    title: categoryNames.get(c._id)?.en ?? `Category ${c._id}`,
    titleArabic: categoryNames.get(c._id)?.ar ?? "",
    source: "hisn",
    chapters: []
  }));
  const categoryById = new Map(categories.map((c, i) => [`hisn-${i + 1}`, c]));

  const chapters = new Map();
  for (const ch of rows("SELECT _id, category_id FROM azkar_chapter ORDER BY _id")) {
    const chapter = {
      id: `hisn-ch-${ch._id}`,
      title: chapterNames.get(ch._id)?.en ?? `Chapter ${ch._id}`,
      titleArabic: chapterNames.get(ch._id)?.ar ?? "",
      duas: []
    };
    chapters.set(ch._id, chapter);
    categoryById.get(`hisn-${ch.category_id}`)?.chapters.push(chapter);
  }

  for (const item of rows("SELECT _id, chapter_id, item FROM azkar_item ORDER BY _id")) {
    const t = itemText.get(item._id) ?? {};
    const ref = referenceText.get(referenceIdByItem.get(item._id)) ?? {};
    chapters.get(item.chapter_id)?.duas.push({
      id: `hisn-${item._id}`,
      number: item._id,
      arabic: (t.ar || item.item || "").trim(),
      translations: [
        t.en && { language: "English", label: "English", text: t.en },
        t.fa && { language: "Persian", label: "فارسی", text: t.fa, dir: "rtl" },
        t.ru && { language: "Russian", label: "Русский", text: t.ru }
      ].filter(Boolean),
      reference: ref.en || "",
      referenceArabic: ref.ar || "",
      source: "Hisn al-Muslim"
    });
  }

  db.close();
  for (const c of categories) c.chapters = c.chapters.filter((ch) => ch.duas.length);
  return categories.filter((c) => c.chapters.length);
}

// ---------------------------------------------------------------- Qur'an

// Verses that are supplications (or the dhikr the Sunnah uses as one),
// grouped by theme. "a-b" ranges are read together as one dua.
const QURAN_THEMES = [
  ["Guidance & Steadfastness", ["1:1-7", "3:8", "3:9", "18:10", "18:24", "28:22", "20:114", "3:53", "5:83", "7:126", "2:250"]],
  [
    "Forgiveness & Mercy",
    ["2:285", "2:286", "3:16", "3:147", "3:193", "3:194", "7:23", "7:143", "7:151", "7:155", "7:156", "23:109", "23:118", "28:16",
     "59:10", "66:8", "71:28", "14:41", "26:86", "11:47", "21:87", "38:35", "40:7", "40:8", "40:9"]
  ],
  ["Good in This World & the Hereafter", ["2:201", "3:191", "3:192", "26:83", "26:84", "26:85", "26:87", "7:47", "25:65", "25:66"]],
  ["Parents, Spouses & Children", ["25:74", "14:40", "17:24", "3:38", "21:89", "37:100", "46:15", "2:128", "19:5", "19:6", "3:35", "3:36", "14:37", "14:35", "2:126"]],
  [
    "Hardship, Relief & Ease",
    ["20:25-28", "21:83", "12:86", "28:24", "54:10", "26:118", "26:169", "23:26", "23:39", "5:25", "10:85", "10:86",
     "4:75", "28:21", "66:11", "12:33", "23:93", "23:94", "21:112", "29:30", "44:12", "7:89", "60:5"]
  ],
  ["Seeking Refuge & Protection", ["23:97-98", "113:1-5", "114:1-6", "17:80"]],
  ["Trust in Allah", ["3:173", "9:129", "60:4", "11:88", "40:44", "18:39", "2:156"]],
  ["Acceptance & Gratitude", ["2:127", "2:129", "27:19", "12:101", "5:114", "23:29", "2:260", "14:38"]],
  ["Praise & Glorification", ["3:26", "3:27", "6:79", "6:162", "6:163", "17:111", "39:46", "23:28", "35:34", "10:10", "37:180", "37:181", "37:182"]],
  ["Travel", ["43:13-14"]]
];

const EDITIONS = [
  ["quran-uthmani"],
  ["en.transliteration"],
  ["en.sahih", "English", "Saheeh International"],
  ["en.pickthall", "English", "Pickthall"],
  ["ur.jalandhry", "Urdu", "فتح محمد جالندھری", "rtl"],
  ["ur.junagarhi", "Urdu", "محمد جوناگڑھی", "rtl"]
];

async function fetchAyah(ref, attempt = 1) {
  const res = await fetch(`${QURAN_API}/ayah/${ref}/editions/${EDITIONS.map((e) => e[0]).join(",")}`);
  if (!res.ok) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return fetchAyah(ref, attempt + 1);
    }
    throw new Error(`Quran API ${res.status} for ${ref}`);
  }
  return (await res.json()).data;
}

async function buildQuran() {
  const seen = new Set();
  const chapters = [];
  let n = 0;
  for (const [theme, refs] of QURAN_THEMES) {
    const chapter = { id: `quran-${chapters.length + 1}`, title: theme, titleArabic: "", duas: [] };
    for (const ref of refs) {
      if (seen.has(ref)) throw new Error(`Duplicate Quran reference ${ref}`);
      seen.add(ref);
      const [surah, ayahs] = ref.split(":");
      const [from, to = from] = ayahs.split("-").map(Number);
      const parts = [];
      for (let a = from; a <= to; a++) parts.push(await fetchAyah(`${surah}:${a}`));
      const join = (i, sep) => parts.map((p) => p[i].text.trim()).join(sep);
      const first = parts[0][0];
      chapter.duas.push({
        id: `quran-${surah}-${from}${to !== from ? `-${to}` : ""}`,
        number: ++n,
        arabic: join(0, " ۝ "),
        transliteration: join(1, " "),
        translations: EDITIONS.slice(2).map(([, language, label, dir], k) => ({
          language,
          label,
          text: join(k + 2, " "),
          ...(dir ? { dir } : {})
        })),
        reference: `Qur'an ${surah}:${ayahs} — Surah ${first.surah.englishName}`,
        referenceArabic: `${first.surah.name} ${surah}:${ayahs}`,
        source: "Qur'an"
      });
      process.stdout.write(".");
    }
    chapters.push(chapter);
  }
  process.stdout.write("\n");
  return [{ id: "quran", title: "Duas from the Qur'an", titleArabic: "أدعية من القرآن الكريم", source: "quran", chapters }];
}

// ---------------------------------------------------------------- Hisn Urdu

async function fetchJalandhry(ref) {
  const [surah, ayahs] = ref.split(":");
  const [from, to = from] = ayahs.split("-").map(Number);
  const parts = [];
  for (let a = from; a <= to; a++) {
    const res = await fetch(`${QURAN_API}/ayah/${surah}:${a}/ur.jalandhry`);
    if (!res.ok) throw new Error(`Quran API ${res.status} for ${surah}:${a}`);
    parts.push((await res.json()).data.text.trim());
  }
  return parts.join(" ");
}

async function addHisnUrdu(categories) {
  const dir = path.join(process.cwd(), "data", "duas-urdu");
  const urdu = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))) {
      if (k in urdu) throw new Error(`Duplicate Urdu entry for dua ${k} (${f})`);
      urdu[k] = v;
    }
  }
  const duas = categories.flatMap((c) => c.chapters.flatMap((ch) => ch.duas));
  const missing = duas.filter((d) => !(String(d.number) in urdu)).map((d) => d.number);
  const unknown = Object.keys(urdu).filter((k) => !duas.some((d) => String(d.number) === k));
  if (missing.length || unknown.length) throw new Error(`Urdu coverage: missing ${missing} unknown ${unknown}`);

  for (const d of duas) {
    const entry = urdu[String(d.number)];
    let translation;
    if (typeof entry === "string") {
      translation = { language: "Urdu", label: "اردو ترجمہ", text: entry, dir: "rtl", aiAssisted: true };
    } else {
      const verses = [];
      for (const ref of entry.quran) verses.push(await fetchJalandhry(ref));
      const text = [entry.prefix, verses.join("\n\n"), entry.suffix].filter(Boolean).join("\n\n");
      translation = {
        language: "Urdu",
        label: `فتح محمد جالندھری · ${entry.quran.join("، ")}`,
        text,
        dir: "rtl",
        ...(entry.prefix || entry.suffix ? { aiAssisted: true } : {})
      };
    }
    // Urdu right after English.
    d.translations.splice(1, 0, translation);
  }
}

// ---------------------------------------------------------------- main

const hisn = buildHisn(await loadDbPath());
await addHisnUrdu(hisn);
const quran = await buildQuran();
const categories = [...quran, ...hisn];
const count = (cs) => cs.reduce((s, c) => s + c.chapters.reduce((t, ch) => t + ch.duas.length, 0), 0);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify({
    generatedAt: new Date().toISOString().slice(0, 10),
    sources: [
      { name: "Hisn al-Muslim (Sa'id ibn Wahf al-Qahtani)", via: "muslim-data (Apache-2.0)", url: "https://github.com/my-prayers/muslim-data-android" },
      { name: "The Holy Qur'an", via: "AlQuran Cloud API", url: "https://alquran.cloud" }
    ],
    total: count(categories),
    categories
  })
);
console.log(`Qur'an: ${count(quran)} duas · Hisn al-Muslim: ${count(hisn)} duas · total ${count(categories)}`);
console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
