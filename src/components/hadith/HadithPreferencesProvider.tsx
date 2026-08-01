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
  chapterNumber: number;
  updatedAt: number;
}

interface Preferences {
  language: LanguageCode;
  bookmarks: Bookmark[];
  lastRead: Record<string, ReadingPosition>;
}

const DEFAULT_PREFERENCES: Preferences = {
  language: "eng",
  bookmarks: [],
  lastRead: {},
};

interface HadithPreferencesContextValue {
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  bookmarks: Bookmark[];
  isBookmarked: (bookSlug: string, hadithNumber: number) => boolean;
  toggleBookmark: (bookmark: Bookmark) => void;
  lastReadChapter: (bookSlug: string) => number | null;
  setLastReadChapter: (bookSlug: string, chapterNumber: number) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const HadithPreferencesContext = createContext<HadithPreferencesContextValue | null>(null);

export function HadithPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
      language: prefs.language,
      setLanguage: (l) => setPrefs((p) => ({ ...p, language: l })),
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
      lastReadChapter: (bookSlug) => prefs.lastRead[bookSlug]?.chapterNumber ?? null,
      setLastReadChapter: (bookSlug, chapterNumber) =>
        setPrefs((p) => ({
          ...p,
          lastRead: { ...p.lastRead, [bookSlug]: { chapterNumber, updatedAt: Date.now() } },
        })),
      searchOpen,
      setSearchOpen,
    }),
    [prefs, searchOpen]
  );

  return <HadithPreferencesContext.Provider value={value}>{children}</HadithPreferencesContext.Provider>;
}

export function useHadithPreferences(): HadithPreferencesContextValue {
  const ctx = useContext(HadithPreferencesContext);
  if (!ctx) throw new Error("useHadithPreferences must be used within a HadithPreferencesProvider");
  return ctx;
}
