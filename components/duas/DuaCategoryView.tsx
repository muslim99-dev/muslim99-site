"use client";

import { useEffect, useState } from "react";
import type { Dua, DuaChapter } from "@/lib/duas";

const PREFS_KEY = "dua-reader-prefs";
const LANGUAGE_LABELS: Record<string, string> = {
  English: "English",
  Urdu: "اردو",
  Persian: "فارسی",
  Russian: "Русский"
};

function DuaCard({ dua, shownLanguages, showTransliteration }: { dua: Dua; shownLanguages: Set<string>; showTransliteration: boolean }) {
  const [copied, setCopied] = useState(false);
  let translations = dua.translations.filter((t) => shownLanguages.has(t.language));
  // Never leave a dua with no meaning shown — fall back to its first translation.
  if (translations.length === 0 && dua.translations[0]) translations = [dua.translations[0]];

  async function copy() {
    const text = [dua.arabic, dua.transliteration, ...translations.map((t) => t.text), dua.reference && `— ${dua.reference}`]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <article id={dua.id} className="scroll-mt-32 overflow-hidden rounded-card border border-border bg-white transition-shadow target:border-primary target:ring-4 target:ring-primary/15 hover:shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-bg/60 px-5 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-teal-dark px-2 text-xs font-semibold tabular-nums text-white">
            {dua.number}
          </span>
          <span className="text-xs font-medium text-muted">{dua.source}</span>
        </div>
        <button
          onClick={copy}
          className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary-deep"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <div className="space-y-5 px-5 py-6 sm:px-8">
        <p dir="rtl" lang="ar" className="whitespace-pre-line text-right font-quran text-2xl text-teal-dark">
          {dua.arabic}
        </p>

        {showTransliteration && dua.transliteration && (
          <p className="text-[15px] italic leading-relaxed text-primary-deep/90">{dua.transliteration}</p>
        )}

        {translations.map((t, i) => (
          <div key={i}>
            <p className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-deep">
              <span className="h-px w-4 bg-primary/40" />
              {LANGUAGE_LABELS[t.language] ?? t.language}
              {t.label !== t.language && t.label !== LANGUAGE_LABELS[t.language] && !t.aiAssisted && (
                <span className="normal-case tracking-normal font-normal text-muted">· {t.label}</span>
              )}
              {t.aiAssisted && (
                <span
                  className="rounded-full bg-amber-50 px-2 py-0.5 normal-case tracking-normal font-medium text-amber-800 ring-1 ring-amber-200"
                  title="Translated from the Arabic with AI assistance for Muslim99 — not a published scholarly translation. Rely on the Arabic text."
                >
                  AI-assisted translation
                </span>
              )}
            </p>
            <p
              dir={t.dir ?? "ltr"}
              className={
                t.dir === "rtl"
                  ? `whitespace-pre-line text-right leading-[2.3] text-teal-dark/90 ${t.language === "Urdu" ? "font-urdu text-[17px]" : "text-base"}`
                  : "whitespace-pre-line text-[15px] leading-relaxed text-teal-dark/90"
              }
            >
              {t.text}
            </p>
          </div>
        ))}

        {(dua.reference || dua.referenceArabic) && (
          <div className="flex gap-3 rounded-2xl bg-[#FBF7EA] px-4 py-3">
            <span aria-hidden className="mt-0.5 text-gold">
              ❖
            </span>
            <div className="min-w-0 text-xs leading-relaxed">
              <p className="font-semibold uppercase tracking-wide text-gold">Reference</p>
              {dua.reference && <p className="mt-0.5 text-teal-dark/80">{dua.reference}</p>}
              {dua.referenceArabic && dua.referenceArabic !== dua.reference && (
                <p dir="rtl" lang="ar" className="mt-1 text-right font-arabic text-sm leading-loose text-muted">
                  {dua.referenceArabic}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function DuaCategoryView({ chapters }: { chapters: DuaChapter[] }) {
  const available = Array.from(new Set(chapters.flatMap((c) => c.duas.flatMap((d) => d.translations.map((t) => t.language)))));
  const hasTransliteration = chapters.some((c) => c.duas.some((d) => d.transliteration));
  const [shown, setShown] = useState<Set<string>>(new Set(["English", "Urdu"]));
  const [showTranslit, setShowTranslit] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
      if (Array.isArray(saved?.languages)) setShown(new Set(saved.languages));
      if (typeof saved?.transliteration === "boolean") setShowTranslit(saved.transliteration);
    } catch {}
    // Re-apply the #dua anchor after hydration so deep links land correctly.
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, []);

  function persist(languages: Set<string>, transliteration: boolean) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ languages: Array.from(languages), transliteration }));
    } catch {}
  }

  function toggleLanguage(lang: string) {
    const next = new Set(shown);
    next.has(lang) ? next.delete(lang) : next.add(lang);
    setShown(next);
    persist(next, showTranslit);
  }

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-teal-dark text-white" : "text-muted hover:bg-aqua"}`;

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
      {chapters.length > 1 && (
        <nav aria-label="Chapters" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-card border border-border bg-white p-3">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Chapters</p>
            <ul className="space-y-0.5">
              {chapters.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    className="flex items-start justify-between gap-2 rounded-xl px-2 py-1.5 text-[13px] leading-snug text-teal-dark/80 hover:bg-aqua/50 hover:text-primary-deep"
                  >
                    <span>{c.title}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted">{c.duas.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      <div className="min-w-0">
        <div className="sticky top-16 z-10 -mx-1 rounded-full border border-border bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Translations">
            {available.map((lang) => (
              <button key={lang} onClick={() => toggleLanguage(lang)} aria-pressed={shown.has(lang)} className={pill(shown.has(lang))}>
                {LANGUAGE_LABELS[lang] ?? lang}
              </button>
            ))}
            {hasTransliteration && (
              <>
                <span className="mx-1 h-4 w-px bg-border" aria-hidden />
                <button
                  onClick={() => {
                    setShowTranslit(!showTranslit);
                    persist(shown, !showTranslit);
                  }}
                  aria-pressed={showTranslit}
                  className={pill(showTranslit)}
                >
                  Transliteration
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-12">
          {chapters.map((c) => (
            <section key={c.id} id={c.id} className="scroll-mt-32">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-teal-dark">{c.title}</h2>
                  <p className="text-xs text-muted">
                    {c.duas.length} {c.duas.length === 1 ? "dua" : "duas"}
                  </p>
                </div>
                {c.titleArabic && (
                  <p dir="rtl" lang="ar" className="font-arabic text-lg leading-loose text-gold">
                    {c.titleArabic}
                  </p>
                )}
              </div>
              <div className="mt-5 space-y-5">
                {c.duas.map((d) => (
                  <DuaCard key={d.id} dua={d} shownLanguages={shown} showTransliteration={showTranslit} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
