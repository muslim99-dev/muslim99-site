"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import QariSelector from "./QariSelector";

export default function QuranHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
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
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
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
            href="/quran"
            className="hidden rounded-full px-3.5 py-2 text-[14px] font-medium sm:block"
            style={{ color: "var(--muted)" }}
          >
            All Surahs
          </Link>
          <QariSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
