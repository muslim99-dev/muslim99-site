"use client";

import { Fragment, useState } from "react";

const COLLAPSE_AT = 3200; // characters

export function languageTextClass(language: string, dir: "rtl" | "ltr") {
  if (language === "Urdu") return "font-urdu text-[1.06em] leading-[2.35] text-right";
  if (dir === "rtl") return "font-arabic text-[1.19em] leading-[2.1] text-right";
  return "text-[0.97em] leading-[1.85]";
}

/** Inline formatting: ﴿Qur'an quotations﴾ and [[editor footnotes]]. */
function renderInline(text: string) {
  const parts = text.split(/(﴿[^﴾]*﴾|\[\[[\s\S]*?\]\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("﴿")) {
      return (
        <span key={i} className="font-quran text-[1.08em] text-primary-deep">
          {part}
        </span>
      );
    }
    if (part.startsWith("[[")) {
      return (
        <span key={i} className="mx-0.5 rounded bg-bg px-1 align-middle text-[0.72em] text-muted" title="Editor's note">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function TafsirText({
  text,
  language,
  dir,
  collapsible = true
}: {
  text: string;
  language: string;
  dir: "rtl" | "ltr";
  collapsible?: boolean;
}) {
  const clean = text.replace(/\(p-[\d٠-٩]+\)/g, "").trim();
  const long = collapsible && clean.length > COLLAPSE_AT;
  const [open, setOpen] = useState(false);
  const shown = long && !open ? clean.slice(0, COLLAPSE_AT).replace(/\s+\S*$/, "") + " …" : clean;
  const paragraphs = shown.split(/\n\s*\n|\n/).filter((p) => p.trim());

  return (
    <div dir={dir} lang={language === "Urdu" ? "ur" : language === "Arabic" ? "ar" : undefined}>
      <div className={`space-y-3 text-teal-dark/90 ${languageTextClass(language, dir)}`}>
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {renderInline(p)}
          </p>
        ))}
      </div>
      {long && (
        <button
          onClick={() => setOpen(!open)}
          dir="ltr"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-primary-deep transition-colors hover:border-primary hover:bg-aqua/40"
        >
          {open ? "Show less" : `Read full commentary (${Math.round(clean.length / 1000)}k characters)`}
          <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
      )}
    </div>
  );
}
