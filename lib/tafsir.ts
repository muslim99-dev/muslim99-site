/**
 * TafsirProvider
 * ------------------------------------------------------------------
 * Source: spa5k/tafsir_api on GitHub (itself sourced from QUL — Tarteel's
 * Quranic Universal Library — and altafsir.com), fetched live per surah
 * with clear author attribution, matching the app's content-accuracy
 * rule: tafsir is never merged across sources or fabricated.
 *
 * The full dataset has 122 editions. Only these 34 are included here —
 * every one individually verified as either a classical work whose
 * author died well over a century ago (safely public domain) or an
 * Arabic-original work with no separate translator to complicate its
 * copyright status. The other ~88 are modern (e.g. Ibn Uthaymeen, Sayyid
 * Qutb, the institutional "Al-Mukhtasar" project and its ~25 language
 * editions) or unverified translations of classical works — a
 * translation is separately copyrightable from its source text
 * regardless of the source's age, so those are deliberately excluded.
 */

export type TafsirEdition = {
  slug: string;
  name: string;
  author: string;
  language: string;
};

export const TAFSIRS: TafsirEdition[] = [
  { slug: "ar-tafsir-ibn-kathir", name: "Tafsir Ibn Kathir", author: "Hafiz Ibn Kathir", language: "Arabic" },
  { slug: "ar-tafsir-al-baghawi", name: "Tafsir al-Baghawi", author: "Al-Baghawi", language: "Arabic" },
  { slug: "ar-tafseer-al-qurtubi", name: "Tafsir al-Qurtubi", author: "Al-Qurtubi", language: "Arabic" },
  { slug: "ar-tafsir-al-jalalayn", name: "Tafsir al-Jalalayn", author: "Al-Mahalli & As-Suyuti", language: "Arabic" },
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
  { slug: "ar-tafseer-tanwir-al-miqbas", name: "Tanwir al-Miqbas", author: "attrib. Ibn Abbas, comp. Al-Fayruzabadi", language: "Arabic" },
  { slug: "al-kashshaf-al-zamakhshari", name: "Al-Kashshaf", author: "Al-Zamakhshari", language: "Arabic" },
  { slug: "al-durr-al-manthur", name: "Al-Durr al-Manthur", author: "As-Suyuti", language: "Arabic" },
  { slug: "al-muharrar-al-wajiz-ibn-atiyyah", name: "Al-Muharrar al-Wajiz", author: "Ibn Atiyyah", language: "Arabic" },
  { slug: "fath-al-qadir-al-shawkani", name: "Fath al-Qadir", author: "Ash-Shawkani", language: "Arabic" },
  { slug: "nazam-al-durar-al-biqa-i", name: "Nazam al-Durar", author: "Al-Biqa'i", language: "Arabic" },
  { slug: "al-basit", name: "Al-Basit", author: "Al-Wahidi", language: "Arabic" },
  { slug: "al-wajiz-wahidi", name: "Al-Wajiz", author: "Al-Wahidi", language: "Arabic" },
  { slug: "al-bahr-al-muhit", name: "Al-Bahr al-Muhit", author: "Abu Hayyan al-Gharnati", language: "Arabic" },
  { slug: "al-dur-al-masun-lil-samin-al-halabi", name: "Al-Durr al-Masun", author: "As-Samin al-Halabi", language: "Arabic" },
  { slug: "ar-tafsir-al-tabari", name: "Tafsir al-Tabari", author: "Ibn Jarir al-Tabari", language: "Arabic" },
  { slug: "ar-tafseer-al-saddi", name: "Tafsir al-Suddi", author: "Al-Suddi", language: "Arabic" },
  { slug: "ar-tafsir-al-tha-alibi", name: "Al-Jawahir al-Hisan", author: "Al-Tha'alibi", language: "Arabic" },
  { slug: "al-lubab-fi-ulum-al-kitab", name: "Al-Lubab fi Ulum al-Kitab", author: "Ibn Adil al-Hanbali", language: "Arabic" },
  { slug: "fath-al-bayan-li-al-qanuji", name: "Fath al-Bayan fi Maqasid al-Qur'an", author: "Siddiq Hasan Khan al-Qannauji", language: "Arabic" },
];

const RAW_BASE = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";

export type TafsirAyah = { ayah: number; text: string };

export async function getTafsirForSurah(slug: string, surahNumber: number): Promise<TafsirAyah[]> {
  const res = await fetch(`${RAW_BASE}/${slug}/${surahNumber}.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Tafsir request failed: ${res.status}`);
  const raw = await res.json();
  // Most editions are a plain array; a few (e.g. Tanwir al-Miqbas) wrap it
  // as { ayahs: [...] }.
  const verses: { ayah: number; text: string }[] = Array.isArray(raw) ? raw : Array.isArray(raw?.ayahs) ? raw.ayahs : [];
  return verses.filter((v) => v.text && v.text.trim().length > 0);
}

export function findTafsir(slug: string): TafsirEdition {
  return TAFSIRS.find((t) => t.slug === slug) ?? TAFSIRS[0];
}
