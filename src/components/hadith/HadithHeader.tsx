"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useHadithPreferences } from "./HadithPreferencesProvider";
import type { HadithLanguage } from "@/lib/hadith";

export default function HadithHeader({
  backHref,
  backLabel,
  availableLanguages,
}: {
  backHref?: string;
  backLabel?: string;
  availableLanguages?: HadithLanguage[];
}) {
  const { setSearchOpen } = useHadithPreferences();

  return (
    <header className="sticky top-0 z-40">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 backdrop-blur-xl sm:px-6"
        style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label={backLabel ?? "Back"}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              style={{ background: "var(--soft)", color: "var(--primary)" }}
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <Link href="/">
            <Logo size={32} />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/hadith"
            className="hidden rounded-full px-3.5 py-2 text-[14px] font-medium sm:block"
            style={{ color: "var(--muted)" }}
          >
            All Books
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search hadiths"
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <Search size={15} />
            <span className="hidden sm:inline">Search</span>
            <kbd
              className="hidden rounded px-1.5 py-0.5 text-[10.5px] font-semibold sm:inline"
              style={{ background: "var(--soft)", color: "var(--soft-text)" }}
            >
              /
            </kbd>
          </button>
          {availableLanguages && availableLanguages.length > 0 && <LanguageSwitcher availableLanguages={availableLanguages} />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
