/**
 * "Continue reading" for the Hadith section — the last hadith read in each
 * collection, kept in this browser's localStorage so it works without an
 * account. Client-only; every access is guarded because storage can be
 * unavailable (private mode, blocked site data).
 */

export type ReadingPosition = {
  slug: string;
  collectionName: string;
  book: number;
  chapter: number;
  hadith: number;
  chapterTitle: string;
  at: number; // epoch ms
};

const KEY = "hadith-reading-history";
const EVENT = "hadith-history-change";

export function getReadingHistory(): ReadingPosition[] {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, ReadingPosition>;
    return Object.values(map).sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

export function saveReadingPosition(pos: Omit<ReadingPosition, "at">) {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, ReadingPosition>;
    const prev = map[pos.slug];
    if (prev && prev.book === pos.book && prev.chapter === pos.chapter && prev.hadith === pos.hadith) return;
    map[pos.slug] = { ...pos, at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function removeReadingPosition(slug: string) {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, ReadingPosition>;
    delete map[slug];
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function onReadingHistoryChange(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function timeAgo(at: number): string {
  const s = Math.round((Date.now() - at) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
