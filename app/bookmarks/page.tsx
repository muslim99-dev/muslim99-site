"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Bookmark = { id: string; type: string; refId: string; folder: string; createdAt: string };

const TYPE_LABEL: Record<string, string> = {
  AYAH: "Quran",
  HADITH: "Hadith",
  TAFSIR: "Tafsir",
  DUA: "Dua",
  NAME: "Names of Allah"
};

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => setBookmarks(d.bookmarks ?? []));
  }, [status]);

  async function remove(b: Bookmark) {
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: b.type, refId: b.refId })
    });
    setBookmarks((prev) => prev?.filter((x) => x.id !== b.id) ?? null);
  }

  if (status === "loading") return <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted">Loading…</div>;

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-2xl font-semibold text-teal-dark">Bookmarks</h1>
        <p className="mt-3 text-sm text-muted">Sign in to save and view your bookmarks across devices.</p>
        <Link href="/auth/signin" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white">
          Sign In
        </Link>
      </div>
    );
  }

  const filtered = bookmarks?.filter((b) => filter === "ALL" || b.type === filter) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-2xl font-semibold text-teal-dark">Bookmarks</h1>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        {["ALL", "AYAH", "HADITH", "TAFSIR", "DUA", "NAME"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1.5 ${
              filter === t ? "border-primary bg-aqua text-primary-deep" : "border-border text-muted"
            }`}
          >
            {t === "ALL" ? "All" : TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {bookmarks === null ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-sm text-muted">You haven&apos;t saved anything yet.</p>
          <Link href="/quran" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white">
            Explore Quran
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-card border border-border bg-white p-4">
              <div>
                <p className="text-xs text-muted">{TYPE_LABEL[b.type] ?? b.type}</p>
                <p className="font-medium text-teal-dark">{b.refId}</p>
              </div>
              <button onClick={() => remove(b)} className="text-xs text-muted hover:text-red-600">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
