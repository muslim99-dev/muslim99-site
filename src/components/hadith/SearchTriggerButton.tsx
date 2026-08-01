"use client";

import { Search } from "lucide-react";
import { useHadithPreferences } from "./HadithPreferencesProvider";

export default function SearchTriggerButton() {
  const { setSearchOpen } = useHadithPreferences();

  return (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full border px-5 py-3 text-left text-[14px] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)", boxShadow: "var(--shadow-sm)" }}
    >
      <Search size={16} style={{ color: "var(--faint)" }} />
      <span className="flex-1">Search hadiths, narrators, chapters…</span>
      <kbd
        className="rounded px-1.5 py-0.5 text-[10.5px] font-semibold"
        style={{ background: "var(--soft)", color: "var(--soft-text)" }}
      >
        /
      </kbd>
    </button>
  );
}
