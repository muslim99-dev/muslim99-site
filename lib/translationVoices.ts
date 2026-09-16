/**
 * TRANSLATION_VOICES
 * ------------------------------------------------------------------
 * Pre-recorded, verse-by-verse audio of someone reading a translation's
 * *meaning* aloud (not Quran recitation). This is genuinely rare content
 * — across alquran.cloud's entire audio catalog only 8 non-Arabic
 * per-ayah editions are even listed, and only these 5 were verified
 * (live HTTP check) to actually have working files on the CDN. There is
 * no free/open source with anywhere near "100+" of these — most
 * languages simply have no recorded translation narration at all.
 *
 * Uses the same per-ayah CDN as ayahAudioUrl in lib/quranApi.ts.
 */

export type TranslationVoice = {
  id: string;
  language: string;
  narrator: string;
};

export const TRANSLATION_VOICES: TranslationVoice[] = [
  { id: "zh.chinese", language: "Chinese", narrator: "Chinese narration" },
  { id: "fr.leclerc", language: "French", narrator: "Youssouf Leclerc" },
  { id: "ru.kuliev-audio", language: "Russian", narrator: "Elmir Kuliev (1MuslimApp)" },
  { id: "kk.khalifahaltai-audio", language: "Kazakh", narrator: "Khalifah Altai" },
  { id: "uz.sodik-audio", language: "Uzbek", narrator: "Muhammad Sodik Muhammad Yusuf" },
];

export function findTranslationVoice(id: string): TranslationVoice | undefined {
  return TRANSLATION_VOICES.find((v) => v.id === id);
}
