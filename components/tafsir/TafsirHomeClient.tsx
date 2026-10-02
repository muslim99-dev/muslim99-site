"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TAFSIRS, findTafsir, tafsirLanguages, type TafsirEdition } from "@/lib/tafsir";
import { loadLastRead, setPreferredEdition, type LastRead } from "@/lib/tafsirPrefs";
import SurahGrid from "@/components/tafsir/SurahGrid";
import TafsirLibrary from "@/components/tafsir/TafsirLibrary";

type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number };

const MAIN_LANGUAGES = ["Urdu", "English", "Arabic", "Bengali", "Indonesian", "Turkish", "Russian", "Persian"];

/** Language-first chooser: most people pick by the language they read. */
function EditionChooser({ value, onChange }: { value: TafsirEdition; onChange: (slug: string) => void }) {
  const languages = useMemo(() => tafsirLanguages(), []);
  const [language, setLanguage] = useState(value.language);
  const [showAll, setShowAll] = useState(!MAIN_LANGUAGES.includes(value.language));
  const visibleLangs = showAll ? languages.map((l) => l.language) : MAIN_LANGUAGES.filter((l) => languages.some((x) => x.language === l));
  const editions = TAFSIRS.filter((t) => t.language === language).sort((a, b) => (a.type === "Tafsir" ? 0 : 1) - (b.type === "Tafsir" ? 0 : 1));

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">1 · Language</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {visibleLangs.map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              language === l ? "bg-teal-dark text-white" : "bg-bg text-teal-dark hover:bg-aqua"
            }`}
          >
            {l}
          </button>
        ))}
        {!showAll && (
          <button onClick={() => setShowAll(true)} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-primary-deep hover:bg-aqua">
            + {languages.length - visibleLangs.length} more
          </button>
        )}
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">2 · Tafsir</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {editions.map((t) => {
          const active = t.slug === value.slug;
          return (
            <button
              key={t.slug}
              onClick={() => onChange(t.slug)}
              aria-pressed={active}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                active ? "border-primary bg-aqua/50" : "border-border bg-white hover:border-primary/50"
              }`}
            >
              <span
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${active ? "border-primary" : "border-border"}`}
                aria-hidden
              >
                {active && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-teal-dark">{t.name}</span>
                <span className="block text-xs text-muted">
                  {[t.author, t.type !== "Tafsir" ? t.type : null].filter(Boolean).join(" · ") || " "}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TafsirHomeClient({ surahs, initialEdition }: { surahs: Surah[] | null; initialEdition: string }) {
  const [edition, setEdition] = useState(() => findTafsir(initialEdition));
  const [chooserOpen, setChooserOpen] = useState(false);
  const [tab, setTab] = useState<"surahs" | "library">("surahs");
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => setLastRead(loadLastRead()), []);

  function choose(slug: string) {
    setPreferredEdition(slug);
    setEdition(findTafsir(slug));
    setChooserOpen(false);
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        {/* Your tafsir */}
        <section className="rounded-card border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Your tafsir</p>
              <p className="mt-1 text-lg font-semibold leading-snug text-teal-dark">{edition.name}</p>
              <p className="text-sm text-muted">{[edition.author, edition.language].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChooserOpen(!chooserOpen)}
                aria-expanded={chooserOpen}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-teal-dark transition-colors hover:border-primary"
              >
                {chooserOpen ? "Done" : "Change"}
              </button>
              <Link href={`/tafsir/1?edition=${edition.slug}`} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-deep">
                Start reading
              </Link>
            </div>
          </div>
          {chooserOpen && (
            <div className="mt-5 border-t border-border pt-5">
              <EditionChooser value={edition} onChange={choose} />
            </div>
          )}
        </section>

        {/* Continue reading */}
        {lastRead && (
          <Link
            href={`/tafsir/${lastRead.surah}?edition=${lastRead.edition}&ayah=${lastRead.ayah}#ayah-${lastRead.ayah}`}
            className="group flex items-center gap-4 rounded-card border border-gold/40 bg-gradient-to-br from-white to-[#FBF7EA] p-5 shadow-sm transition-shadow hover:shadow-card lg:w-80"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/15 text-lg text-gold" aria-hidden>
              ▶
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Continue reading</span>
              <span className="mt-0.5 block font-semibold text-teal-dark group-hover:text-primary-deep">
                {lastRead.surahName} · Ayah {lastRead.ayah}
              </span>
              <span className="block truncate text-xs text-muted">{lastRead.editionName}</span>
            </span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-10 flex items-center gap-1 border-b border-border" role="tablist">
        {(
          [
            ["surahs", "Surahs", 114],
            ["library", "Tafsir books", TAFSIRS.length]
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === key ? "border-primary text-teal-dark" : "border-transparent text-muted hover:text-teal-dark"
            }`}
          >
            {label} <span className="ml-1 rounded-full bg-bg px-2 py-0.5 text-xs text-muted">{count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "surahs" ? (
          surahs ? (
            <SurahGrid surahs={surahs} edition={edition.slug} />
          ) : (
            <p className="rounded-card border border-border bg-white p-6 text-sm text-muted">Couldn&apos;t load the surah list. Please try again.</p>
          )
        ) : (
          <TafsirLibrary />
        )}
      </div>
    </div>
  );
}
