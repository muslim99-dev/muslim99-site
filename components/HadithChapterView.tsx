"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Chapter } from "@/lib/hadith";

export default function HadithChapterView({ chapter }: { chapter: Chapter }) {
  const [showArabic, setShowArabic] = useState(true);
  const [showUrdu, setShowUrdu] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [expandedUrduVariants, setExpandedUrduVariants] = useState<Set<number>>(new Set());
  const searchParams = useSearchParams();
  const targetHadith = searchParams.get("hadith");

  // Deep-linked from search results (?hadith=N) — scroll to and briefly
  // highlight the specific hadith instead of leaving the visitor to scan
  // the whole chapter for it.
  useEffect(() => {
    if (!targetHadith) return;
    const el = document.getElementById(`hadith-${targetHadith}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [targetHadith]);

  function toggleUrduVariants(hadithNumber: number) {
    setExpandedUrduVariants((prev) => {
      const next = new Set(prev);
      next.has(hadithNumber) ? next.delete(hadithNumber) : next.add(hadithNumber);
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <input type="checkbox" checked={showArabic} onChange={(e) => setShowArabic(e.target.checked)} />
          Arabic
        </label>
        <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <input type="checkbox" checked={showUrdu} onChange={(e) => setShowUrdu(e.target.checked)} />
          Urdu
        </label>
        <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} />
          English
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {chapter.hadiths.map((h) => (
          <div
            key={h.hadith_number}
            id={`hadith-${h.hadith_number}`}
            className={`rounded-card border p-5 transition-colors ${
              targetHadith === String(h.hadith_number) ? "border-primary bg-aqua/40" : "border-border bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua text-[11px] font-medium text-primary-deep">
                {h.hadith_number}
              </span>
              {h.status && (
                <span className="rounded-full bg-aqua px-2.5 py-0.5 text-[11px] font-medium text-primary-deep">
                  {h.status}
                </span>
              )}
            </div>

            {showArabic && h.arabic_text && (
              <p dir="rtl" className="mt-4 text-right font-quran text-xl leading-loose text-teal-dark">
                {h.arabic_text}
              </p>
            )}

            {showEnglish && h.english_translation && (
              <p className="mt-3 text-[15px] leading-relaxed text-teal-dark">{h.english_translation}</p>
            )}

            {showUrdu && h.urdu_translation && (
              <p dir="rtl" className="mt-3 text-right text-[15px] leading-relaxed text-muted font-urdu">
                {h.urdu_translation}
              </p>
            )}

            {showUrdu && h.urdu_translations && h.urdu_translations.length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <button
                  onClick={() => toggleUrduVariants(h.hadith_number)}
                  className="text-xs font-medium text-primary-deep"
                >
                  {expandedUrduVariants.has(h.hadith_number)
                    ? "Hide other Urdu translations"
                    : `Show ${h.urdu_translations.length} other Urdu translation${h.urdu_translations.length > 1 ? "s" : ""}`}
                </button>
                {expandedUrduVariants.has(h.hadith_number) && (
                  <div className="mt-3 space-y-3">
                    {h.urdu_translations.map((t, i) => (
                      <div key={i}>
                        <p className="text-[11px] font-medium text-muted">{t.translator}</p>
                        <p dir="rtl" className="mt-1 text-right text-sm leading-relaxed text-muted font-urdu">
                          {t.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
