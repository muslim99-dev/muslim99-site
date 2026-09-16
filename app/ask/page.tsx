"use client";

import { useRef, useState } from "react";
import { TRANSLATIONS } from "@/lib/translations";

const RESPONSE_LANGUAGES = Array.from(new Set(["English", ...TRANSLATIONS.map((t) => t.language)])).sort((a, b) =>
  a === "English" ? -1 : b === "English" ? 1 : a.localeCompare(b)
);

type Source = { surahNumber: number; surahName: string; numberInSurah: number; text: string };
type HadithSource = { bookName: string; bookSlug: string; hadithnumber: number; text: string };
type Turn = { question: string; answer?: string; sources?: Source[]; hadithSources?: HadithSource[]; error?: string };

export default function AskPage() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);
    setTurns((prev) => [...prev, { question }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language })
      });
      const data = await res.json();
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = res.ok
          ? { question, answer: data.answer, sources: data.sources, hadithSources: data.hadithSources }
          : { question, error: data.error ?? "Something went wrong." };
        return next;
      });
    } catch {
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = { question, error: "Couldn't reach the assistant. Check your connection." };
        return next;
      });
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-0 py-8 flex flex-col min-h-[70vh]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Ask</h1>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-full border border-border px-3 py-1.5 bg-white text-xs"
          aria-label="Response language"
        >
          {RESPONSE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-sm text-muted">
        Ask about the Quran, Hadith, tafsir, or Islamic practice. Answers are grounded in Quran verses retrieved
        live for your question and cited by Surah:Ayah — never invented. Questions outside Islamic topics will be
        politely declined.
      </p>

      <div className="mt-6 flex-1 space-y-5">
        {turns.length === 0 && (
          <div className="rounded-card border border-border bg-white p-6 text-sm text-muted">
            Try: "What does the Quran say about patience?" or "What is the ruling on missing a fast?"
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto max-w-[85%] rounded-card bg-primary text-white px-4 py-2.5 text-sm w-fit">
              {t.question}
            </div>

            {t.error && (
              <div className="max-w-[85%] rounded-card border border-border bg-white px-4 py-2.5 text-sm text-muted">
                {t.error}
              </div>
            )}

            {t.answer && (
              <div className="max-w-[90%] rounded-card border border-border bg-white p-4">
                <p className="text-[15px] leading-relaxed text-teal-dark whitespace-pre-wrap">{t.answer}</p>
                {((t.sources && t.sources.length > 0) || (t.hadithSources && t.hadithSources.length > 0)) && (
                  <div className="mt-3 border-t border-border pt-3 space-y-1.5">
                    <p className="text-[11px] font-medium text-muted">Sources</p>
                    {t.sources?.map((s) => (
                      <p key={`q-${s.surahNumber}:${s.numberInSurah}`} className="text-xs text-muted">
                        <span className="font-medium text-primary-deep">
                          {s.surahNumber}:{s.numberInSurah} ({s.surahName})
                        </span>{" "}
                        — {s.text}
                      </p>
                    ))}
                    {t.hadithSources?.map((h) => (
                      <p key={`h-${h.bookSlug}-${h.hadithnumber}`} className="text-xs text-muted">
                        <span className="font-medium text-primary-deep">
                          {h.bookName} #{h.hadithnumber}
                        </span>{" "}
                        — {h.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!t.answer && !t.error && i === turns.length - 1 && (
              <div className="max-w-[85%] rounded-card border border-border bg-white px-4 py-2.5 text-sm text-muted">
                Thinking…
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={ask} className="mt-6 sticky bottom-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-full border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-primary text-white px-5 py-3 text-sm font-medium disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
