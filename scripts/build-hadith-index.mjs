/**
 * Builds the lightweight indexes the Hadith section reads at runtime from
 * the raw on-disk dataset in data/hadith_data (unzipped hadith_data.zip):
 *
 *   data/hadith_index/manifest.json.gz        every collection → book →
 *                                             chapter with titles and counts
 *   data/hadith_index/search/<slug>.json.gz   one compact row per hadith with
 *                                             normalized text for search
 *   data/hadith_index/chapters/<slug>/<book>/<chapter>.json.gz
 *                                             full chapter text
 *
 * Everything is gzipped because the site reads only this folder at
 * runtime, and it has to fit inside a serverless function bundle (Vercel
 * caps those at 250 MB; the raw dataset alone is ~430 MB).
 *
 * Counts come from the files actually present, not the collection.json /
 * book.json metadata, which overstates some collections (e.g. Musannaf).
 *
 * Collections in data/hadith_extra (imported from the Hadith API Toon dataset
 * by scripts/import-hadith-toon.py) use the same layout with gzipped chapter
 * files, and carry an author, intro, source and translation note.
 *
 * Run after replacing the dataset:  node scripts/build-hadith-index.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOTS = [path.join(process.cwd(), "data", "hadith_data"), path.join(process.cwd(), "data", "hadith_extra")];
const OUT = path.join(process.cwd(), "data", "hadith_index");

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const num = (name) => Number(name.match(/(\d+)/)?.[1]);
const readJSON = (p) => {
  const buf = fs.readFileSync(p);
  return JSON.parse((p.endsWith(".gz") ? zlib.gunzipSync(buf) : buf).toString("utf8"));
};

// Must stay in sync with normalize() in lib/hadith.ts.
function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "") // Arabic diacritics + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

const writeGz = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(data), { level: 9 }));
};

fs.rmSync(OUT, { recursive: true, force: true });

const collections = [];
const dirs = ROOTS.filter((r) => fs.existsSync(r)).flatMap((root) =>
  fs.readdirSync(root).sort().map((dir) => ({ root, dir }))
);
for (const { root, dir } of dirs) {
  const colPath = path.join(root, dir);
  if (!fs.statSync(colPath).isDirectory()) continue;
  const meta = readJSON(path.join(colPath, "collection.json"));
  const slug = slugify(dir);
  const languages = new Set();
  const rows = [];
  const books = [];

  const bookDirs = fs.readdirSync(path.join(colPath, "books")).sort((a, b) => num(a) - num(b));
  for (const bookDir of bookDirs) {
    const bookPath = path.join(colPath, "books", bookDir);
    const bookMeta = readJSON(path.join(bookPath, "book.json"));
    const bookNumber = num(bookDir);
    const chapters = [];
    // Some books ship with an empty chapters folder, which git doesn't keep —
    // so in a fresh checkout the folder is missing entirely.
    const chaptersDir = path.join(bookPath, "chapters");
    const chapterFiles = (fs.existsSync(chaptersDir) ? fs.readdirSync(chaptersDir) : [])
      .filter((f) => f.endsWith(".json") || f.endsWith(".json.gz"))
      .sort((a, b) => num(a) - num(b));
    if (chapterFiles.length === 0) continue; // nothing to read — don't list an empty book

    for (const file of chapterFiles) {
      const ch = readJSON(path.join(bookPath, "chapters", file));
      const hadiths = ch.hadiths || [];
      writeGz(path.join(OUT, "chapters", slug, String(bookNumber), `${num(file)}.json.gz`), {
        arabic: ch.arabic || "",
        urdu: ch.urdu || "",
        english: ch.english || "",
        hadiths
      });
      chapters.push({
        number: num(file),
        arabic: ch.arabic || "",
        urdu: ch.urdu || "",
        english: ch.english || "",
        total_hadiths: hadiths.length
      });
      for (const h of hadiths) {
        if (h.arabic_text) languages.add("Arabic");
        if (h.urdu_translation) languages.add("Urdu");
        if (h.english_translation) languages.add("English");
        rows.push([
          bookNumber,
          num(file),
          h.hadith_number,
          h.status || "",
          normalize([h.english_translation, h.urdu_translation, h.arabic_text].filter(Boolean).join(" ‖ "))
        ]);
      }
    }

    books.push({
      number: bookNumber,
      arabic: bookMeta.arabic || "",
      urdu: bookMeta.urdu || "",
      english: bookMeta.english || "",
      total_chapters: chapters.length,
      total_hadiths: chapters.reduce((s, c) => s + c.total_hadiths, 0),
      chapters
    });
  }

  writeGz(path.join(OUT, "search", `${slug}.json.gz`), rows);
  collections.push({
    slug,
    dir,
    name: meta.name || dir,
    name_arabic: meta.name_arabic || "",
    name_urdu: meta.name_urdu || "",
    ...(meta.author && { author: meta.author }),
    ...(meta.intro && { intro: meta.intro }),
    ...(meta.intro_urdu && { intro_urdu: meta.intro_urdu }),
    ...(meta.source && { source: meta.source }),
    ...(meta.translation_note && { translation_note: meta.translation_note }),
    total_hadiths: books.reduce((s, b) => s + b.total_hadiths, 0),
    total_books: books.length,
    languages: ["Arabic", "Urdu", "English"].filter((l) => languages.has(l)),
    books
  });
  console.log(`${slug.padEnd(40)} ${String(books.length).padStart(4)} books ${String(rows.length).padStart(7)} hadiths`);
}

writeGz(path.join(OUT, "manifest.json.gz"), { collections });
console.log(`\nWrote ${collections.length} collections to ${path.relative(process.cwd(), OUT)}`);
