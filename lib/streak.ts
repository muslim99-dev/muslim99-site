/**
 * Daily streaks for signed-in users. A day counts when the user opens the
 * site (calendar day in their own time zone). Missing a whole day breaks
 * the streak; it can be restored the same day with restore credits — one
 * credit per missed day, 5 credits per month.
 */
import { prisma } from "./prisma";

export const MONTHLY_RESTORE_CREDITS = 5;

export function safeTz(tz: unknown) {
  if (typeof tz !== "string" || tz.length > 64) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** "YYYY-MM-DD" for `date` in the given time zone. */
export function dayIn(tz: string, date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export type StreakView = {
  current: number;
  longest: number;
  today: string;
  activeToday: boolean;
  credits: number;
  monthlyCredits: number;
  /** A streak that broke today and can still be restored. */
  broken: { streak: number; missedDays: number; canRestore: boolean } | null;
  /** Last 7 days, oldest first. */
  week: { date: string; status: "active" | "restored" | "missed" | "today-pending" }[];
};

async function view(userId: string, today: string): Promise<StreakView> {
  const [s, days] = await Promise.all([
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.streakDay.findMany({ where: { userId, date: { gte: addDays(today, -6) } }, select: { date: true, restored: true } })
  ]);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const credits = s && s.creditsMonth === today.slice(0, 7) ? s.restoreCredits : MONTHLY_RESTORE_CREDITS;
  // The current streak only stands if it reaches yesterday or today.
  const alive = s?.lastDate && daysBetween(s.lastDate, today) <= 1;
  const broken = s && s.brokenOn === today && s.brokenStreak > 0 ? { streak: s.brokenStreak, missedDays: s.missedDays, canRestore: credits >= s.missedDays } : null;
  return {
    current: alive ? s!.current : 0,
    longest: s?.longest ?? 0,
    today,
    activeToday: s?.lastDate === today,
    credits,
    monthlyCredits: MONTHLY_RESTORE_CREDITS,
    broken,
    week: Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6);
      const d = byDate.get(date);
      return { date, status: d ? (d.restored ? "restored" : "active") : date === today ? "today-pending" : "missed" };
    })
  };
}

export async function getStreak(userId: string, tz: string) {
  return view(userId, dayIn(tz));
}

/** Records today's visit and updates the streak. Safe to call many times a day. */
export async function checkIn(userId: string, tz: string) {
  const today = dayIn(tz);
  const month = today.slice(0, 7);

  await prisma.$transaction(async (tx) => {
    const s = await tx.userStreak.findUnique({ where: { userId } });
    const credits = !s || s.creditsMonth !== month ? MONTHLY_RESTORE_CREDITS : s.restoreCredits;

    if (s?.lastDate === today) {
      if (s.creditsMonth !== month) await tx.userStreak.update({ where: { userId }, data: { restoreCredits: credits, creditsMonth: month } });
      return;
    }

    let current = 1;
    let broken: { brokenStreak: number; brokenOn: string | null; missedDays: number } = { brokenStreak: 0, brokenOn: null, missedDays: 0 };
    if (s?.lastDate) {
      const gap = daysBetween(s.lastDate, today);
      if (gap === 1) current = s.current + 1;
      else if (gap > 1 && s.current > 0) broken = { brokenStreak: s.current, brokenOn: today, missedDays: gap - 1 };
      else if (gap <= 0) current = s.current; // clock/time-zone moved backwards — keep it
    }

    const data = {
      current,
      longest: Math.max(s?.longest ?? 0, current),
      lastDate: today,
      restoreCredits: credits,
      creditsMonth: month,
      ...broken
    };
    await tx.userStreak.upsert({ where: { userId }, create: { userId, ...data }, update: data });
    await tx.streakDay.upsert({ where: { userId_date: { userId, date: today } }, create: { userId, date: today }, update: {} });
  });

  return view(userId, today);
}

/** Restores a streak that broke today, spending one credit per missed day. */
export async function restoreStreak(userId: string, tz: string): Promise<{ error: string } | { view: StreakView }> {
  const today = dayIn(tz);
  const month = today.slice(0, 7);
  const result = await prisma.$transaction(async (tx) => {
    const s = await tx.userStreak.findUnique({ where: { userId } });
    if (!s || s.brokenOn !== today || s.brokenStreak <= 0) return { error: "There's no broken streak to restore today." };
    const credits = s.creditsMonth === month ? s.restoreCredits : MONTHLY_RESTORE_CREDITS;
    if (credits < s.missedDays) {
      return { error: `Restoring needs ${s.missedDays} credits — you have ${credits} left this month.` };
    }
    // The missed days are filled in (shown as restored) without counting
    // towards the length: a 10-day streak continued today becomes 11.
    const current = s.brokenStreak + (s.lastDate === today ? s.current : 0);
    await tx.userStreak.update({
      where: { userId },
      data: {
        current,
        longest: Math.max(s.longest, current),
        restoreCredits: credits - s.missedDays,
        creditsMonth: month,
        brokenStreak: 0,
        brokenOn: null,
        missedDays: 0
      }
    });
    for (let i = 1; i <= s.missedDays; i++) {
      const date = addDays(today, -i);
      await tx.streakDay.upsert({ where: { userId_date: { userId, date } }, create: { userId, date, restored: true }, update: { restored: true } });
    }
    return null;
  });
  if (result) return result;
  return { view: await view(userId, today) };
}
