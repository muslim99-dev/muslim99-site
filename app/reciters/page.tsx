"use client";

import { useEffect, useState } from "react";
import { RECITERS, DEFAULT_RECITER_ID } from "@/lib/reciters";

export default function RecitersPage() {
  const [selected, setSelected] = useState(DEFAULT_RECITER_ID);

  useEffect(() => {
    setSelected(localStorage.getItem("reciter") ?? DEFAULT_RECITER_ID);
  }, []);

  function selectReciter(id: string) {
    setSelected(id);
    localStorage.setItem("reciter", id);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Reciters</h1>
      <p className="mt-2 text-sm text-muted">
        {RECITERS.length} reciters, verified against the audio source. Reciters marked{" "}
        <span className="font-medium">Verse audio</span> play exactly the verse you tap; the rest play the full
        surah with that reciter's voice, since that's the only recording that exists for them. Recordings are
        served from the Islamic Network audio CDN with the reciter's name shown on every play.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {RECITERS.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-4 rounded-card border p-5 ${
              selected === r.id ? "border-primary bg-aqua/40" : "border-border bg-white"
            }`}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-aqua text-primary-deep font-medium">
              {r.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-teal-dark text-sm">{r.name}</p>
              <p dir="rtl" className="text-xs text-muted mt-0.5 font-arabic3">
                {r.arabic}
              </p>
              <p className="text-[11px] text-muted mt-1">
                {r.mode === "ayah" ? "Verse audio · 114 Surahs" : "Full-surah audio · 114 Surahs"}
              </p>
            </div>
            <button
              onClick={() => selectReciter(r.id)}
              className={`rounded-full border px-4 py-1.5 text-xs ${
                selected === r.id
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted hover:border-primary hover:text-primary-deep"
              }`}
            >
              {selected === r.id ? "Default" : "Set default"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
