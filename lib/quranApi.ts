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

/**
 * A handful of specific, well-known translations (e.g. Dr. Israr Ahmad's
 * Bayan-ul-Quran) don't exist in alquran.cloud's catalog at all, but do
 * exist on quran.com's own translation catalog under a numeric resource
 * id. Those are registered in lib/translations.ts with an id prefixed
 * "qdc." (e.g. "qdc.158") — this fetches their text from quran.com,
 * keyed by verse_key so it still aligns exactly with the Arabic ayahs
 * from alquran.cloud below.
 */
async function getQuranComTranslation(resourceId: number, surahNumber: number): Promise<Map<string, string>> {
  const res = await fetch(
    `https://api.quran.com/api/v4/quran/translations/${resourceId}?chapter_number=${surahNumber}&fields=verse_key`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`Translation request failed: ${res.status}`);
  const json = await res.json();
  const map = new Map<string, string>();
  for (const t of json.translations ?? []) {
    // Strip footnote markers like <sup foot_note=...>1</sup> that some
    // quran.com translations embed inline.
    map.set(t.verse_key, String(t.text).replace(/<sup[^>]*>.*?<\/sup>/g, "").trim());
  }
  return map;
}

type SurahEdition = { ayahs: Ayah[]; englishName: string; name: string; numberOfAyahs: number; revelationType: string };

/** Arabic (Uthmani script) + one translation edition, aligned by ayah. */
export async function getSurahWithTranslation(
  number: number,
  translationEdition: string = "en.sahih"
) {
  const qdcMatch = translationEdition.match(/^qdc\.(\d+)$/);

  let arabic: SurahEdition;
  let translationAyahs: Ayah[] | null = null;
  let qdcMap: Map<string, string> | null = null;

  if (qdcMatch) {
    [arabic, qdcMap] = await Promise.all([
      getJSON<SurahEdition>(`${BASE}/surah/${number}/quran-uthmani`),
      getQuranComTranslation(Number(qdcMatch[1]), number)
    ]);
  } else {
    const data = await getJSON<[SurahEdition, { ayahs: Ayah[] }]>(
      `${BASE}/surah/${number}/editions/quran-uthmani,${translationEdition}`
    );
    [arabic] = data;
    translationAyahs = data[1].ayahs;
  }

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
      translation: qdcMap ? (qdcMap.get(`${number}:${a.numberInSurah}`) ?? "") : (translationAyahs?.[i]?.text ?? "")
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

/** Full-surah recitation audio (one file per surah), via the same CDN. Used
 * by the reciters list, which covers many more qaris than have per-ayah
 * files — see RECITERS in lib/reciters.ts. */
export function surahAudioUrl(surahNumber: number, reciter: string) {
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNumber}.mp3`;
}

export type VerseTiming = { verseKey: string; from: number; to: number };

/**
 * For the handful of reciters with a `timingRecitationId` (see
 * lib/reciters.ts), quran.com's backend publishes the exact millisecond
 * range each verse occupies within the full-surah recording. This is what
 * lets the reader highlight the live verse for a single continuous audio
 * file instead of only being able to say "the surah is playing".
 */
export async function getSurahTiming(recitationId: number, surahNumber: number) {
  const res = await fetch(
    `https://api.qurancdn.com/api/qdc/audio/reciters/${recitationId}/audio_files?chapter=${surahNumber}&segments=true`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`Timing request failed: ${res.status}`);
  const json = await res.json();
  const file = json.audio_files?.[0];
  if (!file) throw new Error("No audio file for this reciter/surah");
  const timings: VerseTiming[] = (file.verse_timings ?? []).map((t: { verse_key: string; timestamp_from: number; timestamp_to: number }) => ({
    verseKey: t.verse_key,
    from: t.timestamp_from,
    to: t.timestamp_to
  }));
  return { audioUrl: file.audio_url as string, timings };
}
