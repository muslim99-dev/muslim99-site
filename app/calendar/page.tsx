"use client";

import { useEffect, useState } from "react";

export default function CalendarPage() {
  const [today, setToday] = useState<any>(null);
  const [gDate, setGDate] = useState("");
  const [hDate, setHDate] = useState("");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    fetch(`https://api.aladhan.com/v1/gToH/${dd}-${mm}-${now.getFullYear()}`)
      .then((r) => r.json())
      .then((json) => setToday(json.data))
      .catch(() => setToday(null));
  }, []);

  async function convertGToH() {
    if (!gDate) return;
    const [y, m, d] = gDate.split("-");
    const res = await fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}`).then((r) => r.json());
    const h = res.data.hijri;
    setResult(`${h.day} ${h.month.en} ${h.year} AH`);
  }

  async function convertHToG() {
    if (!hDate) return;
    const [y, m, d] = hDate.split("-");
    const res = await fetch(`https://api.aladhan.com/v1/hToG/${d}-${m}-${y}`).then((r) => r.json());
    const g = res.data.gregorian;
    setResult(`${g.day} ${g.month.en} ${g.year} CE`);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Islamic Calendar</h1>

      {today && (
        <div className="mt-6 rounded-card border border-border bg-teal-dark text-white p-7 text-center">
          <p className="text-3xl font-semibold">
            {today.hijri.day} {today.hijri.month.en} {today.hijri.year} AH
          </p>
          <p className="text-aqua mt-1">
            {today.gregorian.day} {today.gregorian.month.en} {today.gregorian.year} CE
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        Lunar month start dates can differ by a day depending on local moon-sighting practice. This calendar shows a
        calculated estimate.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <div className="rounded-card border border-border bg-white p-5">
          <p className="text-sm font-medium text-teal-dark">Gregorian → Hijri</p>
          <input type="date" value={gDate} onChange={(e) => setGDate(e.target.value)} className="mt-3 w-full rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-primary" />
          <button onClick={convertGToH} className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-medium text-white">
            Convert
          </button>
        </div>
        <div className="rounded-card border border-border bg-white p-5">
          <p className="text-sm font-medium text-teal-dark">Hijri → Gregorian</p>
          <input
            placeholder="YYYY-MM-DD (Hijri)"
            value={hDate}
            onChange={(e) => setHDate(e.target.value)}
            className="mt-3 w-full rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button onClick={convertHToG} className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-medium text-white">
            Convert
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 rounded-card border border-border bg-aqua/40 p-5 text-center">
          <p className="text-teal-dark font-medium">{result}</p>
        </div>
      )}
    </div>
  );
}
