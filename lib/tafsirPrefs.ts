/**
 * Tafsir reader preferences.
 * - The chosen edition lives in a cookie so the server renders the
 *   reader in it even when a link has no ?edition= (surah links,
 *   bookmarks, shared URLs without it).
 * - Text size, translation visibility and the last-read position are
 *   per-browser conveniences in localStorage (guarded; storage may be
 *   unavailable).
 */

export const EDITION_COOKIE = "tafsir_edition";

export function setPreferredEdition(slug: string) {
  document.cookie = `${EDITION_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function getPreferredEditionClient(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${EDITION_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export type ReaderSettings = { scale: number; translation: boolean };
const SETTINGS_KEY = "tafsir-reader-settings";
export const SCALES = [0.9, 1, 1.12, 1.25, 1.4];

export function loadSettings(): ReaderSettings {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (s && typeof s.scale === "number") return { scale: s.scale, translation: s.translation !== false };
  } catch {}
  return { scale: 1, translation: true };
}

export function saveSettings(s: ReaderSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

/** Applies settings as CSS variables/attributes the reader markup reads. */
export function applySettings(s: ReaderSettings) {
  document.documentElement.style.setProperty("--tf-scale", String(s.scale));
  document.documentElement.toggleAttribute("data-tf-hide-translation", !s.translation);
}

export type LastRead = { surah: number; surahName: string; ayah: number; edition: string; editionName: string; at: number };
const LAST_KEY = "tafsir-last-read";

export function saveLastRead(v: Omit<LastRead, "at">) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ ...v, at: Date.now() }));
  } catch {}
}

export function loadLastRead(): LastRead | null {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) || "null");
  } catch {
    return null;
  }
}
