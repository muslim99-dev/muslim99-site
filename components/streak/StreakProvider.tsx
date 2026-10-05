"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { StreakView } from "@/lib/streak";

type Ctx = {
  streak: StreakView | null;
  restore: () => Promise<string | null>;
  restoring: boolean;
};

const StreakContext = createContext<Ctx>({ streak: null, restore: async () => null, restoring: false });
export const useStreak = () => useContext(StreakContext);

const tz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

/** Checks the signed-in user in once a day (on load, and when the tab comes
 * back on a new day) and shares their streak with the badge and profile. */
export default function StreakProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [streak, setStreak] = useState<StreakView | null>(null);
  const [restoring, setRestoring] = useState(false);
  const lastDay = useRef<string | null>(null);

  const checkIn = useCallback(async () => {
    try {
      const res = await fetch("/api/streak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tz: tz() }) });
      if (!res.ok) return;
      const data: StreakView = await res.json();
      lastDay.current = data.today;
      setStreak(data);
    } catch {
      /* offline — try again next visit */
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setStreak(null);
      return;
    }
    checkIn();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz(), year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      if (today !== lastDay.current) checkIn();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [status, checkIn]);

  const restore = useCallback(async () => {
    setRestoring(true);
    try {
      const res = await fetch("/api/streak/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tz: tz() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return data.error || "Couldn't restore your streak.";
      setStreak(data);
      return null;
    } catch {
      return "Couldn't reach the server. Try again.";
    } finally {
      setRestoring(false);
    }
  }, []);

  return (
    <StreakContext.Provider value={{ streak, restore, restoring }}>
      {children}
      <BrokenStreakToast />
    </StreakContext.Provider>
  );
}

export function Flame({ lit, className = "h-5 w-5" }: { lit: boolean; className?: string }) {
  // Own gradient id per icon — a shared id breaks when the defining copy is hidden.
  const gid = `flame-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.5c.6 3.1-1 5-2.6 6.8C7.9 11 6.5 12.6 6.5 15a5.5 5.5 0 0 0 11 0c0-2.2-1-4.1-2.3-5.6.1 1.5-.4 2.7-1.5 3.3.4-3.6-.8-7.6-1.7-10.2Z"
        fill={lit ? `url(#${gid})` : "none"}
        stroke={lit ? "none" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB547" />
          <stop offset="1" stopColor="#F2622E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const dayLetter = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en", { weekday: "narrow" });

/** Last-7-days dots. */
export function WeekDots({ week }: { week: StreakView["week"] }) {
  return (
    <div className="flex justify-between gap-1">
      {week.map((d) => (
        <div key={d.date} className="flex flex-col items-center gap-1" title={`${d.date}: ${d.status === "today-pending" ? "today" : d.status}`}>
          <span
            className={`grid h-8 w-8 place-items-center rounded-full text-xs ${
              d.status === "active"
                ? "bg-gradient-to-b from-[#FFB547] to-[#F2622E] text-white"
                : d.status === "restored"
                  ? "bg-[#FFE7C2] text-[#C25A1E] ring-1 ring-[#F2A65A]"
                  : d.status === "today-pending"
                    ? "border-2 border-dashed border-[#F2A65A] text-[#C25A1E]"
                    : "bg-bg text-muted"
            }`}
          >
            {d.status === "active" ? "✓" : d.status === "restored" ? "↺" : ""}
          </span>
          <span className="text-[10px] text-muted">{dayLetter(d.date)}</span>
        </div>
      ))}
    </div>
  );
}

function CreditsRow({ s }: { s: StreakView }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-bg px-3 py-2 text-xs">
      <span className="text-muted">Restore credits this month</span>
      <span className="flex items-center gap-1" aria-label={`${s.credits} of ${s.monthlyCredits} credits left`}>
        {Array.from({ length: s.monthlyCredits }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < s.credits ? "bg-primary" : "bg-border"}`} />
        ))}
        <span className="ml-1 font-semibold text-teal-dark">{s.credits}</span>
      </span>
    </div>
  );
}

function RestoreBox({ s, compact = false }: { s: StreakView; compact?: boolean }) {
  const { restore, restoring } = useStreak();
  const [error, setError] = useState<string | null>(null);
  if (!s.broken) return null;
  const { streak: lost, missedDays, canRestore } = s.broken;
  return (
    <div className={`rounded-2xl border border-[#F2A65A]/50 bg-[#FFF6EA] ${compact ? "p-3" : "p-4"}`}>
      <p className="text-sm font-semibold text-[#9A3F12]">Your {lost}-day streak broke</p>
      <p className="mt-0.5 text-xs text-[#9A3F12]/80">
        You missed {missedDays} {missedDays === 1 ? "day" : "days"}. {canRestore ? `Restore it for ${missedDays} ${missedDays === 1 ? "credit" : "credits"}.` : `Restoring needs ${missedDays} credits — you have ${s.credits}.`}
      </p>
      {canRestore && (
        <button
          onClick={async () => setError(await restore())}
          disabled={restoring}
          className="mt-2.5 w-full rounded-full bg-gradient-to-r from-[#F2862E] to-[#E8541F] py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {restoring ? "Restoring…" : `Restore ${lost}-day streak`}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Header badge (🔥 + count) with a panel. Renders nothing when signed out. */
export function StreakBadge({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { streak } = useStreak();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!streak) return null;
  const lit = streak.current > 0;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Daily streak: ${streak.current} ${streak.current === 1 ? "day" : "days"}`}
        title={`${streak.current}-day streak`}
        className={`relative inline-flex items-center gap-1 rounded-full border font-semibold transition-colors ${compact ? "h-9 px-2.5 text-xs" : "h-10 px-3 text-sm"} ${
          lit ? "border-[#F7C08A] bg-[#FFF6EA] text-[#C25A1E] hover:border-[#F2862E]" : "border-border bg-white text-muted hover:border-primary"
        }`}
      >
        <Flame lit={lit} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{streak.current}</span>
        {streak.broken?.canRestore && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#E8541F] ring-2 ring-white" aria-hidden />}
      </button>
      {open && (
        <div className="fixed inset-x-3 top-[4.5rem] z-50 rounded-card border border-border bg-white p-4 shadow-card md:absolute md:inset-x-auto md:right-0 md:top-12 md:w-[300px]">
          <StreakPanel s={streak} compact />
        </div>
      )}
    </div>
  );
}

export function StreakPanel({ s, compact = false }: { s: StreakView; compact?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${s.current > 0 ? "bg-[#FFF0DD]" : "bg-bg text-muted"}`}>
          <Flame lit={s.current > 0} className="h-7 w-7" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none text-teal-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {s.current} <span className="text-sm font-medium text-muted">{s.current === 1 ? "day" : "days"}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {s.activeToday ? "Today counts — come back tomorrow to keep it going." : "Open Muslim99 today to keep your streak."}
          </p>
        </div>
      </div>
      <WeekDots week={s.week} />
      <RestoreBox s={s} compact={compact} />
      <CreditsRow s={s} />
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Best streak: <span className="font-semibold text-teal-dark">{s.longest} days</span>
        </span>
        {compact && (
          <Link href="/profile" className="font-medium text-primary-deep hover:underline">
            Details →
          </Link>
        )}
      </div>
    </div>
  );
}

/** Shown once per day when a streak has just broken and can be restored. */
function BrokenStreakToast() {
  const { streak } = useStreak();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!streak?.broken) return;
    const key = `streak-toast:${streak.today}`;
    try {
      if (sessionStorage.getItem(key) || localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* storage blocked */
    }
    setHidden(false);
  }, [streak?.broken, streak?.today]);

  if (hidden || !streak?.broken) return null;
  return (
    <div className="fixed inset-x-3 bottom-20 z-[55] mx-auto max-w-sm rounded-card border border-[#F2A65A]/50 bg-white p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:mx-0">
      <button onClick={() => setHidden(true)} aria-label="Close" className="absolute right-3 top-2.5 text-lg text-muted hover:text-teal-dark">
        ×
      </button>
      <div className="flex items-center gap-2">
        <Flame lit={false} className="h-6 w-6 text-[#E8541F]" />
        <p className="font-semibold text-teal-dark">Streak broken</p>
      </div>
      <div className="mt-3">
        <RestoreBox s={streak} compact />
      </div>
      <p className="mt-2 text-[11px] text-muted">
        {streak.credits} of {streak.monthlyCredits} restore credits left this month. Credits refill on the 1st.
      </p>
    </div>
  );
}
