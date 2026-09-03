"use client";

import { useEffect, useState } from "react";
import { useHadithPreferences } from "@/components/hadith/HadithPreferencesProvider";
import type { BookEdition, HadithLanguage, LanguageCode } from "./hadith";

// Switches between languages by fetching the pre-built static JSON directly
// from /hadith_data/<slug>/<lang>.json (a public asset, served as a plain
// file — not an API route) rather than hitting a server endpoint. Keeps the
// hadith section's API surface at zero while still allowing a language filter.
export function useHadithEdition(
  bookSlug: string,
  initialEdition: BookEdition,
  initialLanguage: LanguageCode,
  availableLanguages: HadithLanguage[]
) {
  const { language: preferredLanguage } = useHadithPreferences();
  const [edition, setEdition] = useState(initialEdition);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(initialLanguage);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const target = preferredLanguage && availableLanguages.some((l) => l.code === preferredLanguage) ? preferredLanguage : initialLanguage;
    if (target === currentLanguage) return;

    let cancelled = false;
    setLoading(true);
    setErrored(false);
    fetch(`/hadith_data/${bookSlug}/${target}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<BookEdition>;
      })
      .then((data) => {
        if (cancelled) return;
        setEdition(data);
        setCurrentLanguage(target);
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredLanguage, bookSlug]);

  const direction = availableLanguages.find((l) => l.code === currentLanguage)?.direction ?? "ltr";

  return { edition, direction, currentLanguage, loading, errored };
}
