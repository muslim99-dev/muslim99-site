/**
 * Extracts the Qur'an translations and tafsirs from quran.db (SQLite, not
 * committed — 269 MB) that the site doesn't already get from alquran.cloud,
 * quran.com or the tafsir API, into small gzipped files under data/quran_db:
 *
 *   translations/<id>/<surah>.json.gz   ["ayah 1 text", "ayah 2 text", ...]
 *   tafsir/<slug>/<surah>.json.gz       [{ ayah, text }, ...]
 *   meta.json                           edition list + per-surah coverage
 *
 * quran.db numbers Al-Fatiha the Indo-Pak way (Bismillah = 0, ayah 7 split
 * into 6 and 7); output uses the standard Kufan numbering used everywhere
 * else on the site (Bismillah = 1, 6+7 joined as 7). Every other surah
 * already matches.
 *
 * Usage:  node scripts/build-quran-db.mjs [path/to/quran.db]
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { DatabaseSync } from "node:sqlite";

const DB = process.argv[2] || "quran.db";
const OUT = path.join(process.cwd(), "data", "quran_db");

// [id on the site, translator in quran.db, language, display name]
const TRANSLATIONS = [
  ["m99.en-taqiusmani", "Mufti Taqi Usmani", "English", "Mufti Taqi Usmani"],
  ["m99.ur-kilani", "Abdul Rehman Killani", "Urdu", "Abdul Rehman Kilani"],
  ["m99.ur-bhutvi", "Abdul Salam Bhutvi", "Urdu", "Abdul Salam Bhutvi"],
  ["m99.ur-islahi", "Amin Ahsan Islahi", "Urdu", "Amin Ahsan Islahi"],
  ["m99.ur-aslamsiddiqui", "Dr. Muhammad Aslam Siddiqui", "Urdu", "Dr. Muhammad Aslam Siddiqui"],
  ["m99.ur-muftinaeem", "Mufti Naeem", "Urdu", "Mufti Naeem"],
  ["m99.ur-taqiusmani", "Mufti Taqi Usmani", "Urdu", "Mufti Taqi Usmani (Aasan Tarjuma-e-Quran)"],
  ["m99.ur-noorulamin", "Noor ul Amin", "Urdu", "Noor ul Amin"],
  ["m99.ur-riffataijaz", "Riffat Aijaz", "Urdu", "Riffat Aijaz"],
  ["m99.ur-nighathashmi", "Ustaza Nighat Hashmi", "Urdu", "Ustaza Nighat Hashmi"],
  ["m99.hi-palanpuri", "Moulana Palanpuri", "Hindi", "Maulana Palanpuri"]
];

// [slug, name in quran.db, display name, author, type]
const TAFSIRS = [
  ["ur-taiseer-ul-quran", "Taiseer ul Quran", "Taiseer ul Quran", "Abdul Rehman Kilani", "Tafsir"],
  ["ur-tafseer-al-quran-bhatvi", "Tafseer al Quran", "Tafseer al Quran", "Abdul Salam Bhatvi", "Tafsir"],
  ["ur-ahsan-ul-bayan", "Ahsan ul Bayan", "Ahsan ul Bayan", "Hafiz Salahuddin Yusuf", "Tafsir"],
  ["ur-tafheem-ul-quran", "Tafheem ul Quran", "Tafheem ul Quran", "Abul A'la Maududi", "Tafsir"],
  ["ur-maariful-quran", "Maariful Quran", "Maarif-ul-Quran", "Mufti Muhammad Shafi", "Tafsir"],
  ["ur-tafsir-ibn-abbas", "Tafseer Ibn e Abbas", "Tanwir al-Miqbas min Tafsir Ibn 'Abbas", "Attributed to Ibn 'Abbas", "Tafsir"],
  ["ur-aasan-tarjuma-e-quran", "Aasan Tarjuma e Quran", "Aasan Tarjuma-e-Quran (notes)", "Mufti Taqi Usmani", "Tafsir"],
  ["ur-ahkam-ul-quran", "Ahkam ul Quran", "Ahkam ul Quran", "Imam Abu Bakr", "Tafsir"],
  ["ur-mufradat-ul-quran", "Mufradat ul Quran", "Mufradat ul Quran", "Imam Raghib Isfahani", "Vocabulary (Gharib)"]
];

const db = new DatabaseSync(DB, { readOnly: true });

/** quran.db (surah, number) → standard ayah number. */
function ayahNo(surah, n) {
  if (surah !== 1) return n;
  return n <= 5 ? n + 1 : 7;
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(data), { level: 9 }));
}

/** Rows ordered by surah/number, merged into Map<surah, Map<ayah, text>>
 * (`joiner` joins the two halves of Al-Fatiha's ayah 7). */
function collect(rows, clean = (t) => t, joiner = "\n\n") {
  const out = new Map();
  for (const r of rows) {
    const text = clean(String(r.text ?? "")).trim();
    if (!text) continue;
    const s = Number(r.surah);
    const a = ayahNo(s, Number(r.number));
    if (!out.has(s)) out.set(s, new Map());
    const m = out.get(s);
    m.set(a, m.has(a) ? `${m.get(a)}${joiner}${text}` : text);
  }
  return out;
}

const ayahCounts = new Map(
  db.prepare("select number, total_verses from surahs").all().map((r) => [Number(r.number), Number(r.total_verses)])
);

fs.rmSync(OUT, { recursive: true, force: true });
const meta = { translations: [], tafsirs: [] };

for (const [id, translator, language, name] of TRANSLATIONS) {
  const rows = db
    .prepare(
      `select v.surah_id surah, v.number number, t.text text from translations t join verses v on v.id = t.verse_id
       where t.translator = ? and t.language = ? order by v.surah_id, v.number`
    )
    .all(translator, language);
  // Taqi Usmani's Urdu carries "( ٢ )" markers pointing at his notes, which
  // are published separately as the "Aasan Tarjuma-e-Quran (notes)" tafsir.
  const markers = id === "m99.ur-taqiusmani" ? /\s*\(\s*[0-9٠-٩۰-۹]+\s*\)/g : /$^/;
  const clean = (t) =>
    t
      .replace(markers, "")
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .replace(/\s+([،۔,.])/g, "$1")
      .replace(/^[\s۔]+/, "");
  const bySurah = collect(rows, clean, " ");
  let ayahs = 0;
  for (let s = 1; s <= 114; s++) {
    const m = bySurah.get(s) ?? new Map();
    const list = Array.from({ length: ayahCounts.get(s) }, (_, i) => m.get(i + 1) ?? "");
    ayahs += list.filter(Boolean).length;
    write(path.join(OUT, "translations", id, `${s}.json.gz`), list);
  }
  meta.translations.push({ id, author: name, language });
  console.log(`translation ${id}: ${ayahs} ayahs`);
}

for (const [slug, dbName, name, author, type] of TAFSIRS) {
  const rows = db
    .prepare(
      `select v.surah_id surah, v.number number, t.text text from tafaseers t join verses v on v.id = t.verse_id
       where t.name = ? order by v.surah_id, v.number`
    )
    .all(dbName);
  const bySurah = collect(rows);
  const coverage = [];
  for (const [s, m] of [...bySurah].sort((a, b) => a[0] - b[0])) {
    const list = [...m].sort((a, b) => a[0] - b[0]).map(([ayah, text]) => ({ ayah, text }));
    write(path.join(OUT, "tafsir", slug, `${s}.json.gz`), list);
    coverage.push([s, list.length]);
  }
  meta.tafsirs.push({ slug, name, author, language: "Urdu", dir: "rtl", type, surahs: coverage.length, coverage });
  console.log(`tafsir ${slug}: ${coverage.length} surahs, ${coverage.reduce((n, c) => n + c[1], 0)} ayahs`);
}

fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta));
console.log("done →", OUT);
