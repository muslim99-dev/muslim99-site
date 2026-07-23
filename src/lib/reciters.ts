// Qari (reciter) catalog — ayah-by-ayah audio from everyayah.com, the same
// CDN already used for `verseAudioUrl` in the extracted Quran data
// (https://everyayah.com/data/<folder>/<SSSAAA>.mp3, 3-digit surah + 3-digit
// ayah, 000 = a standalone Bismillah clip where the reciter has one).
// Every folder below was spot-checked live before inclusion. Not every
// reciter has a standalone Bismillah (verse 0) clip — the player must
// tolerate a 404 there and simply skip to verse 1.

export type VoiceKind = "recitation" | "translation";

export interface Reciter {
  id: string;
  name: string;
  style?: string;
  folder: string;
  kind: VoiceKind;
  language?: string;
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

  // Translation audio — a spoken translation recitation, offered as an
  // additional, optional voice (played after the Arabic ayah when enabled).
  {
    id: "en-sahih-walk",
    name: "English Translation",
    style: "Sahih Intl · Ibrahim Walk",
    folder: "English/Sahih_Intnl_Ibrahim_Walk_192kbps",
    kind: "translation",
    language: "English",
  },
];

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS.find((r) => r.id === DEFAULT_RECITER_ID)!;
}

export function ayahAudioUrl(reciter: Reciter, surahNumber: number, verseNumber: number): string {
  const s = String(surahNumber).padStart(3, "0");
  const a = String(verseNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.folder}/${s}${a}.mp3`;
}

export const RECITATION_VOICES = RECITERS.filter((r) => r.kind === "recitation");
export const TRANSLATION_VOICES = RECITERS.filter((r) => r.kind === "translation");
