"use client";

import { useCallback, useEffect, useState } from "react";

type Message = { id: string; name: string; email: string; subject: string | null; message: string; read: boolean; emailed: boolean; createdAt: string };

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MessagesInbox() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't load messages.");
      setMessages(json.messages);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load messages.");
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    return () => clearInterval(t);
  }, [load]);

  async function setRead(id: string, read: boolean) {
    setMessages((m) => m?.map((x) => (x.id === id ? { ...x, read } : x)) ?? null);
    await fetch("/api/admin/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, read }) });
  }

  async function remove(id: string) {
    if (!confirm("Delete this message permanently?")) return;
    setMessages((m) => m?.filter((x) => x.id !== id) ?? null);
    await fetch("/api/admin/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  function toggle(m: Message) {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) setRead(m.id, true);
  }

  const unread = messages?.filter((m) => !m.read).length ?? 0;
  const list = (messages ?? []).filter((m) => filter === "all" || !m.read);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-white p-1 text-sm">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${filter === f ? "bg-teal-dark text-white" : "text-muted hover:text-teal-dark"}`}
            >
              {f === "all" ? `All ${messages ? `(${messages.length})` : ""}` : `Unread (${unread})`}
            </button>
          ))}
        </div>
        <button onClick={load} className="rounded-full border border-border px-4 py-1.5 text-sm text-muted hover:border-primary hover:text-teal-dark">
          Refresh
        </button>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

      {!messages && !error ? (
        <p className="mt-10 text-center text-sm text-muted">Loading messages…</p>
      ) : list.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-border bg-white p-12 text-center">
          <p className="font-medium text-teal-dark">{filter === "unread" ? "No unread messages" : "No messages yet"}</p>
          <p className="mt-1 text-sm text-muted">Messages sent from the Contact page appear here.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((m) => (
            <li key={m.id} className={`overflow-hidden rounded-card border bg-white transition-shadow ${m.read ? "border-border" : "border-primary/50 shadow-card"}`}>
              <button onClick={() => toggle(m)} className="flex w-full items-start gap-4 px-5 py-4 text-left">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-primary"}`} aria-label={m.read ? "Read" : "Unread"} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className={`truncate text-teal-dark ${m.read ? "font-medium" : "font-semibold"}`}>{m.name}</span>
                    <span className="shrink-0 text-xs text-muted">{when(m.createdAt)}</span>
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {m.subject ? <span className="text-teal-dark/80">{m.subject} — </span> : null}
                    {m.message}
                  </span>
                </span>
              </button>
              {open === m.id && (
                <div className="border-t border-border bg-bg/60 px-5 py-5 sm:px-12">
                  <p className="text-sm text-muted">
                    From <span className="font-medium text-teal-dark">{m.name}</span> &lt;{m.email}&gt;
                    {m.subject && (
                      <>
                        {" "}
                        · <span className="text-teal-dark">{m.subject}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-teal-dark">{m.message}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message to Muslim99"}`)}`}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-deep"
                    >
                      Reply by email
                    </a>
                    <button onClick={() => setRead(m.id, !m.read)} className="rounded-full border border-border px-4 py-2 text-xs font-medium text-teal-dark hover:border-primary">
                      Mark as {m.read ? "unread" : "read"}
                    </button>
                    <button onClick={() => remove(m.id)} className="rounded-full border border-border px-4 py-2 text-xs font-medium text-rose-600 hover:border-rose-300 hover:bg-rose-50">
                      Delete
                    </button>
                    <span className="ml-auto text-xs text-muted">{m.emailed ? "✓ Also sent to the team mailbox" : "Saved here only (email not configured or failed)"}</span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
