"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FEATURED_TAFSIRS, TAFSIRS, tafsirLanguages, type TafsirEdition } from "@/lib/tafsir";
import { setPreferredEdition } from "@/lib/tafsirPrefs";

/** Searchable edition chooser that writes the choice into the URL
 * (?edition= or ?compare=), resetting pagination. */
export default function TafsirPicker({
  param,
  value,
  label,
  allowNone = false,
  exclude,
  compact = false,
  onPick
}: {
  param: "edition" | "compare";
  value?: string;
  label: string;
  allowNone?: boolean;
  exclude?: string;
  /** Small chip trigger for toolbars. */
  compact?: boolean;
  /** Handle the choice yourself instead of navigating. */
  onPick?: (slug: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = TAFSIRS.find((t) => t.slug === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("All");
  const panelRef = useRef<HTMLDivElement>(null);
  const languages = useMemo(() => tafsirLanguages(), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function choose(slug: string | null) {
    if (param === "edition" && slug) setPreferredEdition(slug);
    if (onPick && slug) {
      onPick(slug);
      setOpen(false);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set(param, slug);
    else params.delete(param);
    params.delete("page");
    router.push(`${pathname}?${params}`);
    setOpen(false);
  }

  const q = query.trim().toLowerCase();
  const matches = (t: TafsirEdition) =>
    t.slug !== exclude &&
    (language === "All" || t.language === language) &&
    (!q || `${t.name} ${t.author} ${t.language} ${t.type}`.toLowerCase().includes(q));
  const featured = !q && language === "All" ? FEATURED_TAFSIRS.map((s) => TAFSIRS.find((t) => t.slug === s)!).filter((t) => t && matches(t)) : [];
  const grouped = new Map<string, TafsirEdition[]>();
  for (const t of TAFSIRS.filter(matches)) {
    if (featured.includes(t)) continue;
    grouped.set(t.language, [...(grouped.get(t.language) ?? []), t]);
  }

  const Row = ({ t }: { t: TafsirEdition }) => (
    <button
      onClick={() => choose(t.slug)}
      className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-aqua/50 ${
        t.slug === value ? "bg-aqua/60" : ""
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-teal-dark">{t.name}</span>
        {t.author && <span className="block text-xs text-muted">{t.author}</span>}
      </span>
      <span className="shrink-0 text-right text-[10px] leading-tight text-muted">
        <span className="block font-medium uppercase tracking-wide text-primary-deep">{t.language}</span>
        {t.type !== "Tafsir" && <span className="block">{t.type}</span>}
      </span>
    </button>
  );

  return (
    <div className="relative" ref={panelRef}>
      {compact ? (
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          title={label}
          className={`flex max-w-[15rem] items-center gap-2 rounded-full border px-3 py-1.5 text-left text-sm transition-colors sm:max-w-[20rem] ${
            current ? "border-border bg-white hover:border-primary" : "border-dashed border-border bg-transparent text-muted hover:border-primary"
          }`}
        >
          {current && <span className="shrink-0 rounded bg-aqua px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-deep">{current.language.slice(0, 2)}</span>}
          <span className="truncate font-medium text-teal-dark">{current ? current.name : label}</span>
          <span aria-hidden className="shrink-0 text-xs text-muted">▾</span>
        </button>
      ) : (
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-white px-4 py-2.5 text-left transition-colors hover:border-primary sm:w-auto sm:min-w-[300px]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
          <span className="block truncate text-sm font-medium text-teal-dark">
            {current ? current.name : allowNone ? "None — single edition" : "Choose a tafsir"}
          </span>
          {current && (
            <span className="block truncate text-xs text-muted">
              {[current.author, current.language].filter(Boolean).join(" · ")}
            </span>
          )}
        </span>
        <span aria-hidden className="text-muted">
          ▾
        </span>
      </button>
      )}

      {open && (
        <div className="fixed inset-x-3 top-24 z-50 overflow-hidden rounded-card border border-border bg-white shadow-card sm:absolute sm:inset-x-auto sm:left-0 sm:top-auto sm:mt-2 sm:w-[460px]">
          <div className="border-b border-border p-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author or language…"
              className="w-full rounded-full border border-border bg-bg px-4 py-2 text-sm outline-none focus:border-primary focus:bg-white"
            />
            <div className="scrollbar-none mt-2 flex gap-1.5 overflow-x-auto">
              {[{ language: "All", count: TAFSIRS.length }, ...languages].map((l) => (
                <button
                  key={l.language}
                  onClick={() => setLanguage(l.language)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    language === l.language ? "bg-teal-dark text-white" : "bg-bg text-muted hover:bg-aqua"
                  }`}
                >
                  {l.language} <span className="opacity-60">{l.count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {allowNone && value && (
              <button onClick={() => choose(null)} className="mb-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                Remove comparison
              </button>
            )}
            {featured.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Featured</p>
                {featured.map((t) => (
                  <Row key={t.slug} t={t} />
                ))}
              </>
            )}
            {Array.from(grouped).map(([lang, list]) => (
              <div key={lang}>
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {lang} · {list.length}
                </p>
                {list.map((t) => (
                  <Row key={t.slug} t={t} />
                ))}
              </div>
            ))}
            {featured.length === 0 && grouped.size === 0 && <p className="p-4 text-sm text-muted">No editions match.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
