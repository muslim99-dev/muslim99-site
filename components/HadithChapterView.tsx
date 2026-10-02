"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Chapter, Hadith } from "@/lib/hadith";
import { GradeBadge } from "@/components/hadith/HadithUI";

type Lang = "arabic" | "english" | "urdu";
const ARABIC_SIZES = ["text-xl", "text-2xl", "text-[1.7rem]", "text-[2rem]"];
const PREFS_KEY = "hadith-reader-prefs";

function referenceLabel(h: Hadith) {
  const intl = h.reference?.international_number;
  return intl && intl !== String(h.hadith_number) ? `Ref. ${intl}` : null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-deep">
      <span className="h-px w-4 bg-primary/40" />
      {children}
    </p>
  );
}

function HadithCard({
  h,
  collectionName,
  show,
  arabicSize,
  highlighted
}: {
  h: Hadith;
  collectionName: string;
  show: Record<Lang, boolean>;
  arabicSize: string;
  highlighted: boolean;
}) {
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const ref = referenceLabel(h);
  const variants = h.urdu_translations?.filter((t) => t.text && t.text.trim() !== h.urdu_translation?.trim()) ?? [];

  async function copy(kind: "text" | "link") {
    const url = `${window.location.origin}${window.location.pathname}?hadith=${h.hadith_number}`;
    const text =
      kind === "link"
        ? url
        : [h.arabic_text, h.english_translation, h.urdu_translation, `— ${collectionName} #${h.hadith_number}${h.status ? ` (${h.status})` : ""}`]
            .filter(Boolean)
            .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable (insecure context) — nothing useful to do */
    }
  }

  return (
    <article
      id={`hadith-${h.hadith_number}`}
      className={`scroll-mt-28 overflow-hidden rounded-card border bg-white transition-shadow ${
        highlighted ? "border-primary ring-4 ring-primary/15 shadow-card" : "border-border hover:shadow-card"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/60 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 min-w-9 place-items-center rounded-lg bg-teal-dark px-2 text-sm font-semibold tabular-nums text-white">
            {h.hadith_number}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-teal-dark">
              {collectionName} #{h.hadith_number}
            </p>
            {ref && <p className="text-[11px] text-muted">{ref}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GradeBadge status={h.status} />
          <button
            onClick={() => copy("text")}
            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary-deep"
          >
            {copied === "text" ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={() => copy("link")}
            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary-deep"
          >
            {copied === "link" ? "Link copied ✓" : "Share"}
          </button>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8">
        {show.arabic && h.arabic_text && (
          <p dir="rtl" lang="ar" className={`text-right font-quran ${arabicSize} text-teal-dark`}>
            {h.arabic_text}
          </p>
        )}

        {show.english && h.english_translation && (
          <div>
            <SectionLabel>English</SectionLabel>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-teal-dark/90">{h.english_translation}</p>
          </div>
        )}

        {show.urdu && h.urdu_translation && (
          <div>
            <SectionLabel>اردو ترجمہ · Urdu</SectionLabel>
            <p dir="rtl" lang="ur" className="whitespace-pre-line text-right font-urdu text-[17px] leading-[2.4] text-teal-dark/90">
              {h.urdu_translation}
            </p>
          </div>
        )}

        {(show.urdu && variants.length > 0) || h.explanation ? (
          <div className="space-y-2 border-t border-border pt-4">
            {show.urdu && variants.length > 0 && (
              <details className="group rounded-2xl bg-bg/70 open:bg-aqua/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium text-primary-deep">
                  <span>
                    {variants.length} other Urdu translation{variants.length > 1 ? "s" : ""}
                  </span>
                  <span aria-hidden className="transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div className="space-y-5 px-4 pb-4">
                  {variants.map((t, i) => (
                    <div key={i}>
                      <p dir="rtl" className="text-right font-urdu text-xs leading-[2] text-gold">
                        {t.translator}
                      </p>
                      <p dir="rtl" lang="ur" className="mt-1 whitespace-pre-line text-right font-urdu text-[15px] leading-[2.3] text-muted">
                        {t.text}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
            {h.explanation && (
              <details className="group rounded-2xl bg-bg/70 open:bg-aqua/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium text-primary-deep">
                  <span>
                    Explanation · <span className="font-urdu">تشریح</span>
                  </span>
                  <span aria-hidden className="transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <p dir="rtl" lang="ur" className="whitespace-pre-line px-4 pb-4 text-right font-urdu text-[15px] leading-[2.3] text-muted">
                  {h.explanation}
                </p>
              </details>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function HadithChapterView({ chapter, collectionName }: { chapter: Chapter; collectionName: string }) {
  const available: Record<Lang, boolean> = {
    arabic: chapter.hadiths.some((h) => h.arabic_text),
    english: chapter.hadiths.some((h) => h.english_translation),
    urdu: chapter.hadiths.some((h) => h.urdu_translation)
  };
  const [show, setShow] = useState<Record<Lang, boolean>>({ arabic: true, english: true, urdu: true });
  const [sizeIndex, setSizeIndex] = useState(1);
  const searchParams = useSearchParams();
  const targetHadith = searchParams.get("hadith");

  // Reader preferences are a per-visitor convenience — fine if storage is unavailable.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
      if (saved?.show) setShow((s) => ({ ...s, ...saved.show }));
      if (typeof saved?.sizeIndex === "number") setSizeIndex(Math.min(Math.max(saved.sizeIndex, 0), ARABIC_SIZES.length - 1));
    } catch {}
  }, []);

  function savePrefs(next: { show?: Record<Lang, boolean>; sizeIndex?: number }) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ show, sizeIndex, ...next }));
    } catch {}
  }

  function toggle(lang: Lang) {
    const next = { ...show, [lang]: !show[lang] };
    setShow(next);
    savePrefs({ show: next });
  }

  function resize(delta: number) {
    const next = Math.min(Math.max(sizeIndex + delta, 0), ARABIC_SIZES.length - 1);
    setSizeIndex(next);
    savePrefs({ sizeIndex: next });
  }

  // Deep-linked from search results or a shared link (?hadith=N).
  useEffect(() => {
    if (!targetHadith) return;
    document.getElementById(`hadith-${targetHadith}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetHadith]);

  const langs = (["arabic", "english", "urdu"] as Lang[]).filter((l) => available[l]);
  const labels: Record<Lang, string> = { arabic: "Arabic", english: "English", urdu: "Urdu" };

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-1 rounded-full border border-border bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" role="group" aria-label="Languages">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => toggle(l)}
                aria-pressed={show[l]}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  show[l] ? "bg-teal-dark text-white" : "text-muted hover:bg-aqua"
                }`}
              >
                {labels[l]}
              </button>
            ))}
          </div>
          {available.arabic && show.arabic && (
            <div className="flex items-center gap-1" role="group" aria-label="Arabic text size">
              <button
                onClick={() => resize(-1)}
                disabled={sizeIndex === 0}
                className="grid h-7 w-7 place-items-center rounded-full text-xs text-muted hover:bg-aqua disabled:opacity-40"
                aria-label="Smaller Arabic text"
              >
                A−
              </button>
              <button
                onClick={() => resize(1)}
                disabled={sizeIndex === ARABIC_SIZES.length - 1}
                className="grid h-7 w-7 place-items-center rounded-full text-sm text-muted hover:bg-aqua disabled:opacity-40"
                aria-label="Larger Arabic text"
              >
                A+
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {chapter.hadiths.map((h, i) => (
          <HadithCard
            key={`${h.hadith_number}-${i}`}
            h={h}
            collectionName={collectionName}
            show={show}
            arabicSize={ARABIC_SIZES[sizeIndex]}
            highlighted={targetHadith === String(h.hadith_number)}
          />
        ))}
      </div>
    </div>
  );
}
