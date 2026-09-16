/**
 * QuranProvider
 * ------------------------------------------------------------------
 * Per the app's content-accuracy rule, Quran text/translations/audio
 * are NEVER hardcoded in this codebase — they are always fetched live
 * from a source with clear attribution. This file is the single place
 * that talks to that source, so the provider can be swapped later
 * (see /docs/architecture.md) without touching UI components.
 *
 * Source: alquran.cloud (open Quran API, aggregates published
 * editions with editor/edition metadata) + islamic.network audio CDN.
 */

const BASE = "https://api.alquran.cloud/v1";

export type SurahMeta = {
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
};

export type Ayah = {
  number: number; // global ayah number (1-6236)
  numberInSurah: number;
  text: string;
};

export type Edition = {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  type: string;
};

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Quran source request failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error("Quran source returned an error");
  return json.data as T;
}

export async function getSurahList(): Promise<SurahMeta[]> {
  return getJSON<SurahMeta[]>(`${BASE}/surah`);
}

export async function getSurahMeta(number: number): Promise<SurahMeta> {
  const data = await getJSON<any>(`${BASE}/surah/${number}`);
  return data;
}

/** Arabic (Uthmani script) + one translation edition, aligned by ayah. */
export async function getSurahWithTranslation(
  number: number,
  translationEdition: string = "en.sahih"
) {
  const data = await getJSON<[{ ayahs: Ayah[]; englishName: string; name: string; numberOfAyahs: number; revelationType: string }, { ayahs: Ayah[] }]>(
    `${BASE}/surah/${number}/editions/quran-uthmani,${translationEdition}`
  );
  const [arabic, translation] = data;
  return {
    number,
    name: arabic.name,
    englishName: arabic.englishName,
    revelationType: arabic.revelationType,
    numberOfAyahs: arabic.numberOfAyahs,
    ayahs: arabic.ayahs.map((a, i) => ({
      numberInSurah: a.numberInSurah,
      globalNumber: a.number,
      arabic: a.text,
      translation: translation.ayahs[i]?.text ?? ""
    }))
  };
}

export async function getRandomAyah(translationEdition: string = "en.sahih") {
  const globalNumber = Math.floor(Math.random() * 6236) + 1;
  const data = await getJSON<[{ text: string; surah: SurahMeta; numberInSurah: number; number: number }, { text: string }]>(
    `${BASE}/ayah/${globalNumber}/editions/quran-uthmani,${translationEdition}`
  );
  const [arabic, translation] = data;
  return {
    globalNumber: arabic.number,
    surah: arabic.surah,
    numberInSurah: arabic.numberInSurah,
    arabic: arabic.text,
    translation: translation.text
  };
}

export async function getAyah(reference: string, translationEdition: string = "en.sahih") {
  const data = await getJSON<[{ text: string; surah: SurahMeta; numberInSurah: number }, { text: string }]>(
    `${BASE}/ayah/${reference}/editions/quran-uthmani,${translationEdition}`
  );
  const [arabic, translation] = data;
  return { surah: arabic.surah, numberInSurah: arabic.numberInSurah, arabic: arabic.text, translation: translation.text };
}

/** Per-ayah recitation audio (reciter: Mishary Rashid Alafasy, 128kbps), via islamic.network CDN. */
export function ayahAudioUrl(globalAyahNumber: number, reciter: string = "ar.alafasy") {
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalAyahNumber}.mp3`;
}

export const TRANSLATION_EDITIONS: { id: string; label: string; language: string }[] = [
  { id: "en.sahih", label: "Saheeh International", language: "English" },
  { id: "ur.jalandhry", label: "Fateh Muhammad Jalandhry", language: "Urdu" },
  { id: "fr.hamidullah", label: "Muhammad Hamidullah", language: "French" },
  { id: "id.indonesian", label: "Kementerian Agama", language: "Indonesian" },
  { id: "tr.diyanet", label: "Diyanet İşleri", language: "Turkish" },
  { id: "bn.bengali", label: "Muhiuddin Khan", language: "Bengali" },
  { id: "hi.hindi", label: "Suhel Farooq Khan", language: "Hindi" }
];
