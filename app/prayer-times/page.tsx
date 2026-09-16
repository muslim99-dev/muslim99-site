"use client";

import { useEffect, useMemo, useState } from "react";

type Timings = Record<string, string>;

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function PrayerTimesPage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [city, setCity] = useState("");
  const [madhhab, setMadhhab] = useState<"0" | "1">("0"); // 0 = Shafi'i, 1 = Hanafi
  const [method, setMethod] = useState("2"); // ISNA default
  const [timings, setTimings] = useState<Timings | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "error">("idle");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setStatus("loading");
    const ts = Math.floor(Date.now() / 1000);
    fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${coords.lat}&longitude=${coords.lon}&method=${method}&school=${madhhab}`)
      .then((r) => r.json())
      .then((json) => {
        setTimings(json.data.timings);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [coords, madhhab, method]);

  const next = useMemo(() => {
    if (!timings) return null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (const p of PRAYERS) {
      if (toMinutes(timings[p]) > nowMin) return { name: p, time: timings[p] };
    }
    return { name: "Fajr", time: timings.Fajr };
  }, [timings]);

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Prayer Times</h1>

      {status === "denied" && !coords && (
        <div className="mt-6 rounded-card border border-border bg-white p-6">
          <p className="text-teal-dark font-medium">Location access is unavailable.</p>
          <p className="text-sm text-muted mt-1 mb-3">Enter your city so we can calculate accurate timings.</p>
          <div className="flex gap-2">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City, Country"
              className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={async () => {
                if (!city) return;
                setStatus("loading");
                const geo = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=&method=${method}&school=${madhhab}`)
                  .then((r) => r.json())
                  .catch(() => null);
                if (geo?.data?.timings) {
                  setTimings(geo.data.timings);
                  setStatus("idle");
                } else {
                  setStatus("error");
                }
              }}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
            >
              Set City
            </button>
          </div>
        </div>
      )}

      {next && (
        <div className="mt-6 rounded-card border border-border bg-teal-dark text-white p-7">
          <p className="text-xs uppercase tracking-wide text-aqua">Next Prayer</p>
          <p className="text-3xl font-semibold mt-1">{next.name}</p>
          <p className="text-lg mt-1 text-aqua">{next.time}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm">
          <span className="text-muted">Asr Method</span>
          <select value={madhhab} onChange={(e) => setMadhhab(e.target.value as "0" | "1")} className="bg-transparent font-medium text-teal-dark outline-none">
            <option value="0">Shafi'i</option>
            <option value="1">Hanafi</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm">
          <span className="text-muted">Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-transparent font-medium text-teal-dark outline-none">
            <option value="2">ISNA</option>
            <option value="3">Muslim World League</option>
            <option value="4">Umm Al-Qura</option>
            <option value="1">University of Karachi</option>
            <option value="5">Egyptian General Authority</option>
          </select>
        </div>
      </div>

      {timings && (
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {PRAYERS.map((p) => (
            <div key={p} className="flex items-center justify-between rounded-card border border-border bg-white px-5 py-4">
              <span className="text-teal-dark font-medium">{p}</span>
              <span className="text-muted">{timings[p]}</span>
            </div>
          ))}
        </div>
      )}

      {status === "loading" && <p className="mt-6 text-sm text-muted">Calculating prayer times…</p>}
      {status === "error" && <p className="mt-6 text-sm text-muted">Couldn't fetch prayer times. Please try again.</p>}

      <p className="mt-8 text-xs text-muted">
        Prayer times can vary slightly depending on calculation method, location, and local authority. Adjust the
        settings above to match your local mosque's convention.
      </p>
    </div>
  );
}
