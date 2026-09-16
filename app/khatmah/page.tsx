"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Khatmah = {
  id: string;
  startDate: string;
  targetDays: number;
  pagesRead: number;
  status: string;
};

const PRESETS = [7, 15, 30, 60, 90];
const TOTAL_PAGES = 604;

export default function KhatmahPage() {
  const { status } = useSession();
  const [khatmah, setKhatmah] = useState<Khatmah | null | undefined>(undefined);
  const [customDays, setCustomDays] = useState(30);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/khatmah")
      .then((r) => r.json())
      .then((d) => setKhatmah(d.khatmah));
  }, [status]);

  async function start(days: number) {
    const res = await fetch("/api/khatmah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDays: days })
    });
    const data = await res.json();
    setKhatmah(data.khatmah);
  }

  async function updatePages(pages: number) {
    if (!khatmah) return;
    const res = await fetch("/api/khatmah", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: khatmah.id, pagesRead: pages })
    });
    const data = await res.json();
    setKhatmah(data.khatmah);
  }

  if (status === "loading" || khatmah === undefined) {
    return <div className="mx-auto max-w-2xl px-5 py-16 text-sm text-muted">Loading…</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-semibold text-teal-dark">Khatmah Tracker</h1>
        <p className="mt-3 text-sm text-muted">Sign in to start and track a Khatmah (a complete reading of the Quran).</p>
        <Link href="/auth/signin" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white">
          Sign In
        </Link>
      </div>
    );
  }

  if (!khatmah) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-semibold text-teal-dark">Begin your Quran journey</h1>
        <p className="mt-2 text-sm text-muted">Choose how many days you'd like to take to complete the Quran.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => start(d)}
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary-deep"
            >
              {d} days
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <input
            type="number"
            min={1}
            value={customDays}
            onChange={(e) => setCustomDays(Number(e.target.value))}
            className="w-24 rounded-card border border-border px-3 py-2 text-sm text-center"
          />
          <button onClick={() => start(customDays)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
            Start Custom
          </button>
        </div>
      </div>
    );
  }

  const percent = Math.round((khatmah.pagesRead / TOTAL_PAGES) * 100);
  const daysElapsed = Math.max(1, Math.ceil((Date.now() - new Date(khatmah.startDate).getTime()) / 86400000));
  const dailyTarget = Math.ceil(TOTAL_PAGES / khatmah.targetDays);
  const remainingDays = Math.max(0, khatmah.targetDays - daysElapsed);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold text-teal-dark">Khatmah Progress</h1>

      <div className="mt-8 flex flex-col items-center">
        <div
          className="relative grid h-48 w-48 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#18A5A8 ${percent * 3.6}deg, #DDF7F5 0deg)`
          }}
        >
          <div className="grid h-36 w-36 place-items-center rounded-full bg-white">
            <span className="text-3xl font-semibold text-teal-dark">{percent}%</span>
            <span className="text-xs text-muted">
              {khatmah.pagesRead} / {TOTAL_PAGES} pages
            </span>
          </div>
        </div>

        {khatmah.status === "completed" ? (
          <p className="mt-6 font-medium text-primary-deep">Khatmah complete — Alhamdulillah!</p>
        ) : (
          <div className="mt-8 w-full space-y-4 text-sm">
            <div className="flex justify-between rounded-card border border-border bg-white p-4">
              <span className="text-muted">Daily target</span>
              <span className="font-medium text-teal-dark">{dailyTarget} pages</span>
            </div>
            <div className="flex justify-between rounded-card border border-border bg-white p-4">
              <span className="text-muted">Days remaining</span>
              <span className="font-medium text-teal-dark">{remainingDays}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updatePages(khatmah.pagesRead + dailyTarget)}
                className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-deep"
              >
                Log today's {dailyTarget} pages
              </button>
              <button
                onClick={() => updatePages(khatmah.pagesRead + 1)}
                className="rounded-full border border-border px-4 py-2.5 text-sm hover:border-primary"
              >
                +1
              </button>
            </div>
          </div>
        )}

        <button onClick={() => start(khatmah.targetDays)} className="mt-6 text-xs text-muted hover:text-red-600">
          Restart Khatmah
        </button>
      </div>
    </div>
  );
}
