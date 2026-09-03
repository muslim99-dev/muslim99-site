"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LanguageCode } from "@/lib/hadith";

const STORAGE_KEY = "muslim99-hadith-preferences";

export interface Bookmark {
  bookSlug: string;
  bookName: string;
  chapterNumber: number | null;
  hadithNumber: number;
  excerpt: string;
  savedAt: number;
}

interface ReadingPosition {
  bookNumber: number;
  chapterNumber: number;
  updatedAt: number;
}

interface Preferences {
  bookmarks: Bookmark[];
  lastRead: Record<string, ReadingPosition>;
  language: LanguageCode | null;
}

const DEFAULT_PREFERENCES: Preferences = {
  bookmarks: [],
  lastRead: {},
  language: null,
};

interface HadithPreferencesContextValue {
  bookmarks: Bookmark[];
  isBookmarked: (bookSlug: string, hadithNumber: number) => boolean;
  toggleBookmark: (bookmark: Bookmark) => void;
  lastReadChapter: (bookSlug: string) => { bookNumber: number; chapterNumber: number } | null;
  setLastReadChapter: (bookSlug: string, bookNumber: number, chapterNumber: number) => void;
  // null means "use each book's own default language" — only set once the
  // reader explicitly picks a language from the filter.
  language: LanguageCode | null;
  setLanguage: (l: LanguageCode | null) => void;
}

const HadithPreferencesContext = createContext<HadithPreferencesContextValue | null>(null);

export function HadithPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
    } catch {
      // ignore malformed/unavailable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [prefs, hydrated]);

  const value = useMemo<HadithPreferencesContextValue>(
    () => ({
      bookmarks: prefs.bookmarks,
      isBookmarked: (bookSlug, hadithNumber) =>
        prefs.bookmarks.some((b) => b.bookSlug === bookSlug && b.hadithNumber === hadithNumber),
      toggleBookmark: (bookmark) =>
        setPrefs((p) => {
          const exists = p.bookmarks.some(
            (b) => b.bookSlug === bookmark.bookSlug && b.hadithNumber === bookmark.hadithNumber
          );
          return {
            ...p,
            bookmarks: exists
              ? p.bookmarks.filter((b) => !(b.bookSlug === bookmark.bookSlug && b.hadithNumber === bookmark.hadithNumber))
              : [bookmark, ...p.bookmarks].slice(0, 200),
          };
        }),
      lastReadChapter: (bookSlug) => {
        const pos = prefs.lastRead[bookSlug];
        return pos ? { bookNumber: pos.bookNumber, chapterNumber: pos.chapterNumber } : null;
      },
      setLastReadChapter: (bookSlug, bookNumber, chapterNumber) =>
        setPrefs((p) => ({
          ...p,
          lastRead: { ...p.lastRead, [bookSlug]: { bookNumber, chapterNumber, updatedAt: Date.now() } },
        })),
      language: prefs.language,
      setLanguage: (l) => setPrefs((p) => ({ ...p, language: l })),
    }),
    [prefs]
  );

  return <HadithPreferencesContext.Provider value={value}>{children}</HadithPreferencesContext.Provider>;
}

export function useHadithPreferences(): HadithPreferencesContextValue {
  const ctx = useContext(HadithPreferencesContext);
  if (!ctx) throw new Error("useHadithPreferences must be used within a HadithPreferencesProvider");
  return ctx;
}
