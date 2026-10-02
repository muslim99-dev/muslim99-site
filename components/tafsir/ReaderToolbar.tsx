"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TafsirPicker from "@/components/tafsir/TafsirPicker";
import TafsirSearch from "@/components/tafsir/TafsirSearch";
import { SCALES, applySettings, loadSettings, saveLastRead, saveSettings, setPreferredEdition, type ReaderSettings } from "@/lib/tafsirPrefs";

type SurahOption = { number: number; englishName: string; numberOfAyahs: number };

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export default function ReaderToolbar({
  surahs,
  surah,
  surahName,
  totalAyahs,
  edition,
  compare
}: {
  surahs: SurahOption[];
  surah: number;
  surahName: string;
  totalAyahs: number;
  edition: { slug: string; name: string; dir: "rtl" | "ltr" };
  compare?: string;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<ReaderSettings>({ scale: 1, translation: true });
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useOutsideClose(settingsOpen, () => setSettingsOpen(false));

  const query = (extra: Record<string, string | number> = {}) => {
    const p = new URLSearchParams({ edition: edition.slug });
    if (compare) p.set("compare", compare);
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    return p.toString();
  };

  // Restore reader settings; remember this edition as the reader's choice.
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applySettings(s);
    setPreferredEdition(edition.slug);
  }, [edition.slug]);

  // Continue reading: remember the ayah in the upper part of the screen.
  useEffect(() => {
    const record = (ayah: number) =>
      saveLastRead({ surah, surahName, ayah, edition: edition.slug, editionName: edition.name });
    const first = document.querySelector<HTMLElement>("[data-ayah]");
    if (first) record(Number(first.dataset.ayah));
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) record(Number((hit.target as HTMLElement).dataset.ayah));
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    document.querySelectorAll("[data-ayah]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [surah, surahName, edition.slug, edition.name]);

  function update(next: ReaderSettings) {
    setSettings(next);
    applySettings(next);
    saveSettings(next);
  }
  const scaleIndex = Math.max(0, SCALES.indexOf(settings.scale));

  return (
    <div className="relative z-20 -mx-5 border-b border-border bg-bg/95 px-5 py-2.5 backdrop-blur sm:sticky sm:top-16 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={surah}
          onChange={(e) => router.push(`/tafsir/${e.target.value}?${query()}`)}
          aria-label="Surah"
          className="max-w-[11rem] rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-teal-dark outline-none hover:border-primary focus:border-primary"
        >
          {surahs.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.englishName}
            </option>
          ))}
        </select>

        <TafsirPicker param="edition" value={edition.slug} label="Tafsir" compact />
        <TafsirPicker param="compare" value={compare} label="+ Compare" allowNone exclude={edition.slug} compact />

        <select
          onChange={(e) => router.push(`/tafsir/${surah}?${query({ ayah: e.target.value })}#ayah-${e.target.value}`)}
          value=""
          aria-label="Go to ayah"
          className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-teal-dark outline-none hover:border-primary lg:hidden"
        >
          <option value="" disabled>
            Ayah…
          </option>
          {Array.from({ length: totalAyahs }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Ayah {n}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-expanded={searchOpen}
            aria-label="Search this tafsir"
            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
              searchOpen ? "border-primary bg-aqua text-primary-deep" : "border-border bg-white text-muted hover:border-primary"
            }`}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 4 4" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              aria-expanded={settingsOpen}
              aria-label="Reading settings"
              className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold transition-colors ${
                settingsOpen ? "border-primary bg-aqua text-primary-deep" : "border-border bg-white text-muted hover:border-primary"
              }`}
            >
              Aa
            </button>
            {settingsOpen && (
              <div className="absolute right-0 z-30 mt-2 w-64 rounded-card border border-border bg-white p-4 shadow-card">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Text size</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => update({ ...settings, scale: SCALES[Math.max(scaleIndex - 1, 0)] })}
                    disabled={scaleIndex === 0}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-sm hover:border-primary disabled:opacity-40"
                    aria-label="Smaller text"
                  >
                    A−
                  </button>
                  <div className="flex gap-1">
                    {SCALES.map((s, i) => (
                      <span key={s} className={`h-1.5 w-5 rounded-full ${i <= scaleIndex ? "bg-primary" : "bg-border"}`} />
                    ))}
                  </div>
                  <button
                    onClick={() => update({ ...settings, scale: SCALES[Math.min(scaleIndex + 1, SCALES.length - 1)] })}
                    disabled={scaleIndex === SCALES.length - 1}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-base hover:border-primary disabled:opacity-40"
                    aria-label="Larger text"
                  >
                    A+
                  </button>
                </div>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 border-t border-border pt-4 text-sm text-teal-dark">
                  Show translation
                  <input
                    type="checkbox"
                    checked={settings.translation}
                    onChange={(e) => update({ ...settings, translation: e.target.checked })}
                    className="h-4 w-4 accent-[#18A5A8]"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="mt-2.5">
          <TafsirSearch edition={edition.slug} editionName={edition.name} surah={surah} dir={edition.dir} />
        </div>
      )}
    </div>
  );
}
