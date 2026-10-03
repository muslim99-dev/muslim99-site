"use client";

import { useRef, useState } from "react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const SUBJECTS = ["General question", "Feedback or suggestion", "Report a mistake in a text", "Partnership", "Other"];

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef(Date.now());
  const input =
    "w-full rounded-2xl border border-border bg-bg px-4 py-3 text-[15px] text-teal-dark outline-none transition-colors placeholder:text-muted/60 focus:border-primary focus:bg-white";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt: startedAt.current })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "error", message: json.error ?? "Something went wrong. Please try again." });
        return;
      }
      form.reset();
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="flex flex-col items-center rounded-card border border-border bg-white p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 className="mt-4 text-xl font-semibold text-teal-dark">JazakAllahu khairan — message sent</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Thank you for reaching out. We read every message and will reply to the email address you gave us.
        </p>
        <button
          onClick={() => {
            startedAt.current = Date.now();
            setStatus({ kind: "idle" });
          }}
          className="mt-6 rounded-full border border-border px-5 py-2 text-sm font-medium text-teal-dark hover:border-primary"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-border bg-white p-6 shadow-sm sm:p-8" noValidate={false}>
      <h2 className="text-xl font-semibold text-teal-dark">Send us a message</h2>
      <p className="mt-1 text-sm text-muted">All fields except the subject are required.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-teal-dark">Your name</span>
          <input name="name" required maxLength={100} autoComplete="name" placeholder="e.g. Ahmed Khan" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-teal-dark">Email address</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@example.com" className={input} />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-teal-dark">Subject</span>
        <select name="subject" defaultValue={SUBJECTS[0]} className={input}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-teal-dark">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="How can we help? If you're reporting a mistake, please include the page link."
          className={`${input} resize-y`}
        />
      </label>

      {/* Honeypot — hidden from people, filled in by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status.kind === "error" && (
        <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-60 sm:w-auto"
      >
        {status.kind === "sending" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
