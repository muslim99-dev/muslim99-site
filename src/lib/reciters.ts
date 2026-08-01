// Qari (reciter) and translation-voice catalog, sourced from two CDNs:
//
// - "everyayah" (default): https://everyayah.com/data/<folder>/<SSSAAA>.mp3
//   — 3-digit surah + 3-digit ayah, 000 = a standalone Bismillah clip where
//   the reciter has one. Every folder was spot-checked live before inclusion.
//
// - "islamic-network": https://cdn.islamic.network/quran/audio/128/<edition>/<N>.mp3
//   — a single GLOBAL ayah number (1-6236) across the whole Quran, not
//   per-surah. Verified against the Al-Quran Cloud API (api.alquran.cloud)
//   and cross-checked against our own verse text before trusting the offset.
//
// Not every reciter/voice has a standalone Bismillah (verse 0) clip — the
// player must tolerate a 404 there and simply skip to verse 1.

export type VoiceKind = "recitation" | "translation";
export type AudioProvider = "everyayah" | "islamic-network";

export interface Reciter {
  id: string;
  name: string;
  style?: string;
  folder: string;
  kind: VoiceKind;
  language?: string;
  provider?: AudioProvider; // defaults to "everyayah"
}

export const DEFAULT_RECITER_ID = "shuraym";

export const RECITERS: Reciter[] = [
  { id: "shuraym", name: "Saood ash-Shuraym", folder: "Saood_ash-Shuraym_128kbps", kind: "recitation" },
  { id: "alafasy", name: "Mishary Rashid Alafasy", folder: "Alafasy_128kbps", kind: "recitation" },
  { id: "abdul-basit-murattal", name: "Abdul Basit", style: "Murattal", folder: "Abdul_Basit_Murattal_192kbps", kind: "recitation" },
  { id: "abdul-basit-mujawwad", name: "Abdul Basit", style: "Mujawwad", folder: "Abdul_Basit_Mujawwad_128kbps", kind: "recitation" },
  { id: "sudais", name: "Abdur-Rahman As-Sudais", folder: "Abdurrahmaan_As-Sudais_192kbps", kind: "recitation" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", style: "Murattal", folder: "Husary_128kbps", kind: "recitation" },
  { id: "husary-mujawwad", name: "Mahmoud Khalil Al-Husary", style: "Mujawwad", folder: "Husary_Mujawwad_64kbps", kind: "recitation" },
  { id: "minshawi", name: "Mohamed Siddiq El-Minshawi", style: "Murattal", folder: "Minshawy_Murattal_128kbps", kind: "recitation" },
  { id: "minshawi-mujawwad", name: "Mohamed Siddiq El-Minshawi", style: "Mujawwad", folder: "Minshawy_Mujawwad_192kbps", kind: "recitation" },
  { id: "hudhaify", name: "Ali Al-Hudhaify", folder: "Hudhaify_128kbps", kind: "recitation" },
  { id: "muhsin-al-qasim", name: "Muhsin Al Qasim", folder: "Muhsin_Al_Qasim_192kbps", kind: "recitation" },
  { id: "qatami", name: "Nasser Al Qatami", folder: "Nasser_Alqatami_128kbps", kind: "recitation" },
  { id: "dussary", name: "Yasser Ad-Dussary", folder: "Yasser_Ad-Dussary_128kbps", kind: "recitation" },
  { id: "yaser-salamah", name: "Yaser Salamah", folder: "Yaser_Salamah_128kbps", kind: "recitation" },
  { id: "muaiqly", name: "Maher Al Muaiqly", folder: "Maher_AlMuaiqly_64kbps", kind: "recitation" },
  { id: "ghamdi", name: "Saad Al-Ghamdi", folder: "Ghamadi_40kbps", kind: "recitation" },
  { id: "shaatree", name: "Abu Bakr Ash-Shaatree", folder: "Abu_Bakr_Ash-Shaatree_128kbps", kind: "recitation" },
  { id: "tablaway", name: "Mohammad Al-Tablaway", folder: "Mohammad_al_Tablaway_128kbps", kind: "recitation" },
  { id: "ayyoub", name: "Muhammad Ayyoub", folder: "Muhammad_Ayyoub_128kbps", kind: "recitation" },
  { id: "basfar", name: "Abdullah Basfar", folder: "Abdullah_Basfar_192kbps", kind: "recitation" },
  { id: "matroud", name: "Abdullah Matroud", folder: "Abdullah_Matroud_128kbps", kind: "recitation" },
  { id: "alaqimy", name: "Akram AlAlaqimy", folder: "Akram_AlAlaqimy_128kbps", kind: "recitation" },
  { id: "sowaid", name: "Ayman Sowaid", folder: "Ayman_Sowaid_64kbps", kind: "recitation" },
  { id: "abbad", name: "Fares Abbad", folder: "Fares_Abbad_64kbps", kind: "recitation" },
  { id: "hani-rifai", name: "Hani Ar-Rifai", folder: "Hani_Rifai_192kbps", kind: "recitation" },
  { id: "akhdar", name: "Ibrahim Akhdar", folder: "Ibrahim_Akhdar_32kbps", kind: "recitation" },
  { id: "mansoori", name: "Karim Mansoori", folder: "Karim_Mansoori_40kbps", kind: "recitation" },
  { id: "tunaiji", name: "Khalefa Al Tunaiji", folder: "Khalefa_Al_Tunaiji_64kbps", kind: "recitation" },
  { id: "al-banna", name: "Mahmoud Ali Al Banna", folder: "Mahmoud_Ali_Al_Banna_32kbps", kind: "recitation" },
  { id: "mustafa-ismail", name: "Mustafa Ismail", folder: "Mustafa_Ismail_48kbps", kind: "recitation" },
  { id: "parhizgar", name: "Parhizgar", folder: "Parhizgar_48kbps", kind: "recitation" },
  { id: "bukhatir", name: "Salah Bukhatir", folder: "Salaah_AbdulRahman_Bukhatir_128kbps", kind: "recitation" },
  { id: "al-budair", name: "Salah Al Budair", folder: "Salah_Al_Budair_128kbps", kind: "recitation" },
  { id: "juhaynee", name: "Abdullah Al-Juhaynee", folder: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", kind: "recitation" },
  { id: "neana", name: "Ahmed Neana", folder: "Ahmed_Neana_128kbps", kind: "recitation" },
  { id: "alili", name: "Aziz Alili", folder: "Aziz_Alili_128kbps", kind: "recitation" },
  { id: "abdulkareem", name: "Muhammad AbdulKareem", folder: "Muhammad_AbdulKareem_128kbps", kind: "recitation" },
  { id: "ali-jaber", name: "Ali Jaber", folder: "Ali_Jaber_64kbps", kind: "recitation" },

  // Translation audio — a spoken translation, offered as an additional,
  // optional voice (played after the Arabic ayah when enabled). Every entry
  // here was spot-checked live (including the final ayah, 114:6, to rule
  // out incomplete recordings) before inclusion.
  {
    id: "en-sahih-walk",
    name: "English",
    style: "Sahih Intl · Ibrahim Walk",
    folder: "English/Sahih_Intnl_Ibrahim_Walk_192kbps",
    kind: "translation",
    language: "English",
  },
  {
    id: "fa-fooladvand",
    name: "Persian",
    style: "Fooladvand & Hedayatfar",
    folder: "translations/Fooladvand_Hedayatfar_40Kbps",
    kind: "translation",
    language: "Persian",
  },
  {
    id: "fa-makarem",
    name: "Persian",
    style: "Makarem & Kabiri",
    folder: "translations/Makarem_Kabiri_16Kbps",
    kind: "translation",
    language: "Persian",
  },
  {
    id: "ur-shamshad",
    name: "Urdu",
    style: "Shamshad Ali Khan",
    folder: "translations/urdu_shamshad_ali_khan_46kbps",
    kind: "translation",
    language: "Urdu",
  },
  {
    id: "ur-farhat-hashmi",
    name: "Urdu",
    style: "Farhat Hashmi · word-for-word",
    folder: "translations/urdu_farhat_hashmi",
    kind: "translation",
    language: "Urdu",
  },
  {
    id: "bs-korkut",
    name: "Bosnian",
    style: "Besim Korkut",
    folder: "translations/besim_korkut_ajet_po_ajet",
    kind: "translation",
    language: "Bosnian",
  },
  {
    id: "az-balayev",
    name: "Azerbaijani",
    style: "Balayev",
    folder: "translations/azerbaijani/balayev",
    kind: "translation",
    language: "Azerbaijani",
  },
  {
    id: "en-basfar-walk",
    name: "English",
    style: "with Abdullah Basfar's recitation",
    folder: "MultiLanguage/Basfar_Walk_192kbps",
    kind: "translation",
    language: "English",
  },
  {
    id: "zh-chinese",
    name: "Chinese",
    style: "中文 · versebyverse",
    folder: "zh.chinese",
    kind: "translation",
    language: "Chinese",
    provider: "islamic-network",
  },
];

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS.find((r) => r.id === DEFAULT_RECITER_ID)!;
}

// Per-surah ayah counts (surah 1 first) — the standard, fixed Quran ayah
// count per surah, identical across every text/audio source (also matches
// our own extracted index.json, sums to 6236). Hardcoded rather than
// imported from the JSON so this module carries no data-file dependency,
// used to convert a (surah, verse) pair into the single global ayah number
// (1-6236) that the islamic-network CDN indexes by.
const AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77,
  227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19,
  36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

// AYAH_PREFIX_SUM[i] = total ayat in surahs 1..i (AYAH_PREFIX_SUM[0] = 0)
const AYAH_PREFIX_SUM: number[] = [0];
for (const count of AYAH_COUNTS) AYAH_PREFIX_SUM.push(AYAH_PREFIX_SUM[AYAH_PREFIX_SUM.length - 1] + count);

// Returns null when this (surah, verse) has no counted ayah on the
// global-numbering CDN — namely the Bismillah "verse 0" our data carries for
// every surah except 1 and 9, which isn't a standalone counted ayah there.
function globalAyahNumber(surahNumber: number, verseNumber: number): number | null {
  if (surahNumber === 1) {
    // Al-Fatiha's Bismillah IS canonically ayah 1, so our verse 0 -> ayah 1.
    return verseNumber + 1;
  }
  if (verseNumber === 0) {
    return null;
  }
  return AYAH_PREFIX_SUM[surahNumber - 1] + verseNumber;
}

export function ayahAudioUrl(reciter: Reciter, surahNumber: number, verseNumber: number): string {
  if (reciter.provider === "islamic-network") {
    const global = globalAyahNumber(surahNumber, verseNumber);
    // No mapped ayah (unavailable Bismillah track) — return a URL that
    // reliably 404s so the player's existing error-skip handling kicks in,
    // the same way it already does for missing everyayah.com clips.
    return `https://cdn.islamic.network/quran/audio/128/${reciter.folder}/${global ?? 0}.mp3`;
  }
  const s = String(surahNumber).padStart(3, "0");
  const a = String(verseNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.folder}/${s}${a}.mp3`;
}

export const RECITATION_VOICES = RECITERS.filter((r) => r.kind === "recitation");
export const TRANSLATION_VOICES = RECITERS.filter((r) => r.kind === "translation");

export function getTranslationVoice(id: string): Reciter | null {
  return TRANSLATION_VOICES.find((r) => r.id === id) ?? TRANSLATION_VOICES[0] ?? null;
}
