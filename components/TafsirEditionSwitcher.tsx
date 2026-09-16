"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TAFSIRS, findTafsir } from "@/lib/tafsir";

export default function TafsirEditionSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTafsir = findTafsir(current);
  const [langFilter, setLangFilter] = useState(currentTafsir.language);
  const languages = Array.from(new Set(TAFSIRS.map((t) => t.language))).sort();
  const visible = TAFSIRS.filter((t) => t.language === langFilter);

  // Keep the filter in sync if `current` changes from elsewhere (e.g. a
  // future language whose tafsir isn't in the currently-filtered list).
  useEffect(() => {
    setLangFilter(currentTafsir.language);
  }, [currentTafsir.language]);

  function changeTafsir(slug: string) {
    router.push(`${pathname}?edition=${slug}`);
  }

  function changeLangFilter(lang: string) {
    setLangFilter(lang);
    const first = TAFSIRS.find((t) => t.language === lang);
    if (first) changeTafsir(first.slug);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={langFilter}
        onChange={(e) => changeLangFilter(e.target.value)}
        className="rounded-full border border-border px-3 py-1.5 bg-white text-xs"
        aria-label="Tafsir language"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <select
        value={current}
        onChange={(e) => changeTafsir(e.target.value)}
        className="rounded-full border border-border px-3 py-1.5 bg-white text-xs max-w-[220px]"
        aria-label="Tafsir"
      >
        {visible.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name} — {t.author}
          </option>
        ))}
      </select>
    </div>
  );
}
