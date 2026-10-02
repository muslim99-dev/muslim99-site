/**
 * Builds the lightweight indexes the Hadith section reads at runtime from
 * the raw on-disk dataset in data/hadith_data (unzipped hadith_data.zip):
 *
 *   data/hadith_index/manifest.json      every collection → book → chapter
 *                                        with titles and real hadith counts
 *   data/hadith_index/search/<slug>.json one compact row per hadith with
 *                                        normalized text for keyword search
 *
 * Counts come from the files actually present, not the collection.json /
 * book.json metadata, which overstates some collections (e.g. Musannaf).
 *
 * Run after replacing the dataset:  node scripts/build-hadith-index.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "data", "hadith_data");
const OUT = path.join(process.cwd(), "data", "hadith_index");

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const num = (name) => Number(name.match(/(\d+)/)?.[1]);
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

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

fs.mkdirSync(path.join(OUT, "search"), { recursive: true });

const collections = [];
for (const dir of fs.readdirSync(ROOT).sort()) {
  const colPath = path.join(ROOT, dir);
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
    const chapterFiles = fs
      .readdirSync(path.join(bookPath, "chapters"))
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => num(a) - num(b));

    for (const file of chapterFiles) {
      const ch = readJSON(path.join(bookPath, "chapters", file));
      const hadiths = ch.hadiths || [];
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

  fs.writeFileSync(path.join(OUT, "search", `${slug}.json`), JSON.stringify(rows));
  collections.push({
    slug,
    dir,
    name: meta.name || dir,
    name_arabic: meta.name_arabic || "",
    name_urdu: meta.name_urdu || "",
    total_hadiths: books.reduce((s, b) => s + b.total_hadiths, 0),
    total_books: books.length,
    languages: ["Arabic", "Urdu", "English"].filter((l) => languages.has(l)),
    books
  });
  console.log(`${slug.padEnd(40)} ${String(books.length).padStart(4)} books ${String(rows.length).padStart(7)} hadiths`);
}

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ collections }));
console.log(`\nWrote ${collections.length} collections to ${path.relative(process.cwd(), OUT)}`);
