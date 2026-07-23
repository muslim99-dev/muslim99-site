"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_RECITER_ID, getReciter, type Reciter } from "@/lib/reciters";

const STORAGE_KEY = "muslim99-qari-settings";

interface QariSettings {
  reciterId: string;
  translationVoiceOn: boolean;
  autoContinue: boolean;
}

const DEFAULT_SETTINGS: QariSettings = {
  reciterId: DEFAULT_RECITER_ID,
  translationVoiceOn: false,
  autoContinue: false,
};

interface QariContextValue {
  reciter: Reciter;
  reciterId: string;
  setReciterId: (id: string) => void;
  translationVoiceOn: boolean;
  setTranslationVoiceOn: (on: boolean) => void;
  autoContinue: boolean;
  setAutoContinue: (on: boolean) => void;
}

const QariContext = createContext<QariContextValue | null>(null);

export function QariProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<QariSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed/unavailable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [settings, hydrated]);

  const value = useMemo<QariContextValue>(
    () => ({
      reciter: getReciter(settings.reciterId),
      reciterId: settings.reciterId,
      setReciterId: (id) => setSettings((s) => ({ ...s, reciterId: id })),
      translationVoiceOn: settings.translationVoiceOn,
      setTranslationVoiceOn: (on) => setSettings((s) => ({ ...s, translationVoiceOn: on })),
      autoContinue: settings.autoContinue,
      setAutoContinue: (on) => setSettings((s) => ({ ...s, autoContinue: on })),
    }),
    [settings]
  );

  return <QariContext.Provider value={value}>{children}</QariContext.Provider>;
}

export function useQari(): QariContextValue {
  const ctx = useContext(QariContext);
  if (!ctx) throw new Error("useQari must be used within a QariProvider");
  return ctx;
}
