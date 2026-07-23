// Build compact lookup files from the extracted Quran data.
//
// Reads:  public/quran_data/Surah_<n>/details.json
//         public/quran_data/Surah_<n>/verses/<m>/verse.json
// Writes: public/quran_data/index.json          -> [ SurahSummary, ... ] (114)
//         public/quran_data/Surah_<n>/verses.json -> { details, verses: [ VerseBase ] }
//
// The heavy per-verse files (translations / tafaseers / root_words /
// w_by_w_translation) are left in place and fetched on demand by the reader.

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", "quran_data");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const surahDirs = entries
    .filter((e) => e.isDirectory() && /^Surah_\d+$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)));

  const index = [];

  for (const dir of surahDirs) {
    const surahPath = join(ROOT, dir);
    const details = await readJson(join(surahPath, "details.json"));
    index.push(details);

    // Enumerate the actual verse folders (some surahs start at 0 = Bismillah,
    // Surah 9 starts at 1 with no Bismillah).
    const versesRoot = join(surahPath, "verses");
    let verseFolders = [];
    try {
      const vs = await readdir(versesRoot, { withFileTypes: true });
      verseFolders = vs
        .filter((e) => e.isDirectory() && /^\d+$/.test(e.name))
        .map((e) => Number(e.name))
        .sort((a, b) => a - b);
    } catch {
      verseFolders = [];
    }

    const verses = [];
    for (const n of verseFolders) {
      const versePath = join(versesRoot, String(n), "verse.json");
      try {
        await stat(versePath);
      } catch {
        continue;
      }
      const v = await readJson(versePath);
      verses.push({
        verseNumber: v.verseNumber,
        verse: v.verse,
        verseUrdu: v.verseUrdu,
        verseEnglish: v.verseEnglish,
        verseAudioUrl: v.verseAudioUrl,
      });
    }

    await writeFile(
      join(surahPath, "verses.json"),
      JSON.stringify({ details, verses }),
      "utf8"
    );
    process.stdout.write(
      `Surah ${details.surahNumber} (${details.surahName}) — ${verses.length} verses\n`
    );
  }

  await writeFile(join(ROOT, "index.json"), JSON.stringify(index), "utf8");
  process.stdout.write(`\nWrote index.json with ${index.length} surahs.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
