"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TRANSLATIONS, type TranslationEdition } from "@/lib/translations";

/** Languages listed first in the picker, in this order. */
const MAIN_LANGUAGES = ["Urdu", "English", "Arabic", "Hindi", "Bengali", "Indonesian", "Turkish", "Persian"];

/** Each language's name in its own script, shown under the English name. */
const NATIVE: Record<string, string> = {
  Urdu: "اردو",
  Arabic: "العربية",
  Hindi: "हिन्दी",
  Bengali: "বাংলা",
  Persian: "فارسی",
  Turkish: "Türkçe",
  Indonesian: "Bahasa Indonesia",
  Russian: "Русский",
  French: "Français",
  German: "Deutsch",
  Spanish: "Español",
  Chinese: "中文",
  Japanese: "日本語",
  Korean: "한국어",
  Malayalam: "മലയാളം",
  Tamil: "தமிழ்",
  Pashto: "پښتو",
  Kurdish: "Kurdî",
  Bosnian: "Bosanski",
  Portuguese: "Português",
  Italian: "Italiano",
  Dutch: "Nederlands",
  Malay: "Bahasa Melayu",
  Uzbek: "Oʻzbek",
  Azerbaijani: "Azərbaycan",
  Albanian: "Shqip",
  Swahili: "Kiswahili",
  Thai: "ไทย",
  Sindhi: "سنڌي",
  Uyghur: "ئۇيغۇرچە",
  Divehi: "ދިވެހި",
  Amharic: "አማርኛ",
  Hausa: "Hausa",
  Somali: "Soomaali",
  Swedish: "Svenska",
  Norwegian: "Norsk",
  Polish: "Polski",
  Czech: "Čeština",
  Romanian: "Română",
  Bulgarian: "Български",
  Tatar: "Татарча",
  Sinhala: "සිංහල",
  Burmese: "မြန်မာ",
  Chechen: "Нохчийн"
};

/** Widely read translators, offered as one-tap choices. */
const POPULAR = [
  "ur.jalandhry",
  "ur.junagarhi",
  "qdc.158",
  "ur.maududi",
  "ur.kanzuliman",
  "m99.ur-taqiusmani",
  "en.sahih",
  "en.pickthall",
  "en.yusufali",
  "en.hilali",
  "m99.en-taqiusmani",
  "en.itani"
];

const TOTAL_LANGUAGES = new Set(TRANSLATIONS.map((t) => t.language)).size;

const RTL = new Set(["Urdu", "Arabic", "Persian", "Pashto", "Sindhi", "Uyghur", "Divehi", "Kurdish"]);

function initials(name: string) {
  const words = name
    .replace(/\(.*?\)/g, "")
    .split(/[\s-]+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(and|by|of|the|al|ul|e|dr\.?|mufti|maulana|moulana|imam|ala|hazrat|ustaza|allama|syed|translation|quran)$/i.test(w));
  return ((words[0]?.[0] ?? name[0] ?? "?") + (words[1]?.[0] ?? "")).toUpperCase();
}

function LanguageMark({ language, size = "md" }: { language: string; size?: "md" | "lg" }) {
  const native = NATIVE[language];
  const label = native && native.length <= 6 ? native : language.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep font-semibold text-white shadow-sm ${
        size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-xs"
      } ${RTL.has(language) ? "font-urdu" : ""}`}
    >
      {label}
    </span>
  );
}

function Picker({
  value,
  onPick,
  onClose
}: {
  value: TranslationEdition;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState(value.language);
  const listRef = useRef<HTMLDivElement>(null);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of TRANSLATIONS) counts.set(t.language, (counts.get(t.language) ?? 0) + 1);
    const rank = (l: string) => (MAIN_LANGUAGES.includes(l) ? MAIN_LANGUAGES.indexOf(l) : 100);
    return Array.from(counts, ([language, count]) => ({ language, count })).sort(
      (a, b) => rank(a.language) - rank(b.language) || a.language.localeCompare(b.language)
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [language, query]);

  const q = query.trim().toLowerCase();
  const list = (q
    ? TRANSLATIONS.filter((t) => `${t.author} ${t.language} ${NATIVE[t.language] ?? ""}`.toLowerCase().includes(q))
    : TRANSLATIONS.filter((t) => t.language === language)
  )
    .slice()
    .sort((a, b) => {
      const pa = POPULAR.indexOf(a.id), pb = POPULAR.indexOf(b.id);
      return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb) || a.language.localeCompare(b.language) || a.author.localeCompare(b.author);
    });

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Choose a translation">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-teal-dark/40 backdrop-blur-[2px]" />
      <div className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:h-[640px] sm:max-w-4xl sm:rounded-[28px]">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-dark to-primary-deep px-5 pb-5 pt-4 text-white sm:px-7 sm:pt-6">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30 sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Qur&apos;an translation</p>
              <h2 className="mt-1 text-xl font-semibold">Choose a translation</h2>
              <p className="mt-0.5 text-sm text-white/70">
                {TRANSLATIONS.length} translations in {languages.length} languages
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg hover:bg-white/20">
              ×
            </button>
          </div>
          <div className="relative mt-4">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a translator or language — e.g. Maududi, Hindi"
              aria-label="Search translations"
              className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-4 text-sm text-teal-dark shadow-sm outline-none ring-2 ring-transparent placeholder:text-muted focus:ring-gold/60"
            />
          </div>
        </div>

        {/* Mobile: language chips */}
        {!q && (
          <div className="scrollbar-none flex shrink-0 gap-2 overflow-x-auto border-b border-border px-5 py-3 sm:hidden">
            {languages.map((l) => (
              <button
                key={l.language}
                onClick={() => setLanguage(l.language)}
                aria-pressed={language === l.language}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  language === l.language ? "bg-teal-dark text-white" : "bg-bg text-teal-dark"
                }`}
              >
                {l.language} <span className="opacity-60">{l.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          {/* Desktop: language sidebar */}
          {!q && (
            <nav className="hidden w-60 shrink-0 overflow-y-auto border-r border-border bg-bg/60 p-3 sm:block" aria-label="Languages">
              {languages.map((l, i) => (
                <div key={l.language}>
                  {i === MAIN_LANGUAGES.filter((m) => languages.some((x) => x.language === m)).length && (
                    <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">More languages</p>
                  )}
                  <button
                    onClick={() => setLanguage(l.language)}
                    aria-pressed={language === l.language}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                      language === l.language ? "bg-white text-teal-dark shadow-sm ring-1 ring-primary/30" : "text-teal-dark/80 hover:bg-white/70"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{l.language}</span>
                      {NATIVE[l.language] && NATIVE[l.language] !== l.language && (
                        <span className={`block truncate text-[11px] text-muted ${RTL.has(l.language) ? "font-urdu" : ""}`}>{NATIVE[l.language]}</span>
                      )}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        language === l.language ? "bg-primary text-white" : "bg-white text-muted"
                      }`}
                    >
                      {l.count}
                    </span>
                  </button>
                </div>
              ))}
            </nav>
          )}

          {/* Translators */}
          <div ref={listRef} className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {q ? `${list.length} result${list.length === 1 ? "" : "s"} for “${query.trim()}”` : `${language} · ${list.length} translation${list.length === 1 ? "" : "s"}`}
            </p>
            <div className="grid gap-2.5 md:grid-cols-2">
              {list.map((t) => {
                const active = t.id === value.id;
                const popular = POPULAR.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => onPick(t.id)}
                    aria-pressed={active}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                      active
                        ? "border-primary bg-aqua/40 ring-2 ring-primary/20"
                        : "border-border bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                        active ? "bg-primary text-white" : "bg-aqua text-primary-deep group-hover:bg-primary group-hover:text-white"
                      } transition-colors`}
                    >
                      {initials(t.author)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug text-teal-dark">{t.author}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        {t.language}
                        {popular && <span className="rounded-full bg-gold/15 px-2 py-px text-[10px] font-semibold text-[#9A7B1C]">Popular</span>}
                      </span>
                    </span>
                    {active ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                        <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
                          <path d="M7.7 13.3 4.4 10l-1.2 1.2 4.5 4.5 9.5-9.5-1.2-1.2z" />
                        </svg>
                        Current
                      </span>
                    ) : (
                      <span aria-hidden className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {list.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-medium text-teal-dark">No translations match “{query.trim()}”.</p>
                <button onClick={() => setQuery("")} className="mt-2 text-sm font-medium text-primary-deep hover:underline">
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The Qur'an reader's translation panel: current translation, one-tap
 * popular alternatives, a full picker, and (as children) audio options. */
export default function TranslationChooser({
  value,
  onChange,
  children
}: {
  value: TranslationEdition;
  onChange: (id: string) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setPending(null);
  }, [value.id]);

  const sameLanguage = TRANSLATIONS.filter((t) => t.language === value.language);
  const quick = [
    ...POPULAR.map((id) => sameLanguage.find((t) => t.id === id)).filter((t): t is TranslationEdition => !!t),
    ...sameLanguage.filter((t) => !POPULAR.includes(t.id))
  ]
    .filter((t) => t.id !== value.id)
    .slice(0, 4);

  function pick(id: string) {
    setOpen(false);
    if (id === value.id) return;
    setPending(id);
    onChange(id);
  }

  return (
    <section className="mt-4 overflow-hidden rounded-card border border-border bg-gradient-to-br from-white via-white to-aqua/40 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <LanguageMark language={value.language} size="lg" />
        <div className="min-w-[12rem] flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Translation</p>
          <p className="mt-0.5 text-base font-semibold leading-snug text-teal-dark sm:text-lg">{value.author}</p>
          <p className="text-sm text-muted">
            {value.language}
            {NATIVE[value.language] && NATIVE[value.language] !== value.language && (
              <span className={RTL.has(value.language) ? "font-urdu" : ""}> · {NATIVE[value.language]}</span>
            )}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          {[
            [TRANSLATIONS.length, "Translations"],
            [TOTAL_LANGUAGES, "Languages"]
          ].map(([n, label]) => (
            <div key={label} className="flex-1 rounded-2xl border border-border bg-white/80 px-4 py-2 text-center sm:flex-none sm:min-w-[96px]">
              <p className="text-lg font-semibold leading-tight text-teal-dark tabular-nums">{n}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-deep sm:w-auto"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M3 5h12M9 3v2m1.5 0c-1 4.5-3.5 8-7.5 10m3-5c1.5 2 3.5 3.5 6 4.5M13 21l4.5-10L22 21m-7.5-3h6" />
          </svg>
          Change translation
        </button>
      </div>

      {quick.length > 0 && (
        <div className="border-t border-border/70 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">Quick switch:</span>
            {quick.map((t) => (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                disabled={!!pending}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  pending === t.id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-teal-dark hover:border-primary hover:text-primary-deep disabled:opacity-60"
                }`}
              >
                {pending === t.id ? "Loading…" : t.author}
              </button>
            ))}
            <button onClick={() => setOpen(true)} className="px-1 text-xs font-semibold text-primary-deep hover:underline">
              All {sameLanguage.length} in {value.language} →
            </button>
          </div>
        </div>
      )}

      {children && <div className="border-t border-border/70 bg-white/60 px-4 py-3 sm:px-5">{children}</div>}

      {open && <Picker value={value} onPick={pick} onClose={() => setOpen(false)} />}
    </section>
  );
}
