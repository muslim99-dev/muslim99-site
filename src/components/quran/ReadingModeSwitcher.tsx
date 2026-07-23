import Link from "next/link";
import { Rows4, BookMarked, Rows3 } from "lucide-react";

type Mode = "verses" | "read" | "lines";

const MODES: { key: Mode; label: string; icon: typeof Rows4; hrefSuffix: string }[] = [
  { key: "verses", label: "Verses", icon: Rows4, hrefSuffix: "" },
  { key: "read", label: "Continuous", icon: BookMarked, hrefSuffix: "/read" },
  { key: "lines", label: "16-Line", icon: Rows3, hrefSuffix: "/lines" },
];

export default function ReadingModeSwitcher({ surahNumber, active }: { surahNumber: number; active: Mode }) {
  return (
    <div
      className="inline-flex rounded-[var(--r-btn)] border p-1"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {MODES.map((m) => {
        const isActive = m.key === active;
        const Icon = m.icon;
        return (
          <Link
            key={m.key}
            href={`/quran/${surahNumber}${m.hrefSuffix}`}
            className="inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
            style={{ background: isActive ? "var(--grad-btn)" : "transparent", color: isActive ? "var(--primary-ink)" : "var(--muted)" }}
          >
            <Icon size={13} /> {m.label}
          </Link>
        );
      })}
    </div>
  );
}
