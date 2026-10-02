"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { GradeBadge } from "@/components/hadith/HadithUI";
import ContinueReading from "@/components/hadith/ContinueReading";
import { hadithHref, locationKey, parseHadithRefId, type SavedKind } from "@/lib/hadithRefs";
import type { HadithPreview } from "@/app/api/hadith-lookup/route";

type SavedRow = { id: string; refId: string; createdAt: string; kind: SavedKind; key: string };
type Tab = "bookmark" | "favourite";

export default function SavedHadithView() {
  const { status } = useSession();
  const [tab, setTab] = useState<Tab>("bookmark");
  const [rows, setRows] = useState<SavedRow[] | null>(null);
  const [previews, setPreviews] = useState<Record<string, HadithPreview>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const d = await fetch("/api/bookmarks").then((r) => r.json());
        const saved: SavedRow[] = (d.bookmarks ?? [])
          .filter((b: { type: string }) => b.type === "HADITH")
          .flatMap((b: { id: string; refId: string; createdAt: string }) => {
            const loc = parseHadithRefId(b.refId);
            return loc ? [{ id: b.id, refId: b.refId, createdAt: b.createdAt, kind: loc.kind, key: locationKey(loc) }] : [];
          });
        setRows(saved);
        if (saved.length) {
          const res = await fetch("/api/hadith-lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refs: saved.map((s) => s.refId) })
          }).then((r) => r.json());
          setPreviews(res.previews ?? {});
        }
      } catch {
        setError("Couldn't load your saved hadith. Please try again.");
        setRows([]);
      }
    })();
  }, [status]);

  async function remove(row: SavedRow) {
    setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "HADITH", refId: row.refId })
    }).catch(() => {});
  }

  const counts = useMemo(
    () => ({
      bookmark: rows?.filter((r) => r.kind === "bookmark").length ?? 0,
      favourite: rows?.filter((r) => r.kind === "favourite").length ?? 0
    }),
    [rows]
  );
  const visible = rows?.filter((r) => r.kind === tab) ?? [];

  return (
    <div className="space-y-10">
      <ContinueReading limit={6} showLibraryLink={false} />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-border bg-white p-1" role="tablist">
            {(["bookmark", "favourite"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t ? "bg-teal-dark text-white" : "text-muted hover:text-teal-dark"
                }`}
              >
                {t === "bookmark" ? "Bookmarks" : "Favourites"}
                {status === "authenticated" && rows && (
                  <span className={`ml-1.5 text-xs tabular-nums ${tab === t ? "text-white/70" : "text-muted"}`}>
                    {counts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {status === "loading" ? (
          <p className="mt-8 text-sm text-muted">Loading…</p>
        ) : status !== "authenticated" ? (
          <div className="mt-6 rounded-card border border-border bg-white p-10 text-center">
            <p className="font-medium text-teal-dark">Sign in to save hadith</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Bookmark and favourite any hadith while reading and find it here on every device.
            </p>
            <Link
              href="/auth/signin?callbackUrl=%2Fhadith%2Fsaved"
              className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-deep"
            >
              Sign In
            </Link>
          </div>
        ) : rows === null ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-card border border-border bg-white" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-8 text-sm text-muted">{error}</p>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-card border border-dashed border-border bg-white/60 p-10 text-center">
            <p className="font-medium text-teal-dark">No {tab === "bookmark" ? "bookmarks" : "favourites"} yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Tap the {tab === "bookmark" ? "bookmark" : "heart"} icon on any hadith to save it here.
            </p>
            <Link href="/hadith" className="mt-5 inline-block text-sm font-medium text-primary-deep hover:underline">
              Browse collections →
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {visible.map((row) => {
              const p = previews[row.key];
              const loc = parseHadithRefId(row.refId)!;
              return (
                <li key={row.id} className="group relative rounded-card border border-border bg-white p-5 transition-shadow hover:shadow-card">
                  <Link href={hadithHref(loc)} className="absolute inset-0 rounded-card" aria-label="Open hadith" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-teal-dark group-hover:text-primary-deep">
                        {p?.collectionName ?? loc.slug} #{loc.hadith}
                      </p>
                      <p dir="auto" className="mt-0.5 text-xs text-muted line-clamp-1">
                        Book {loc.book} · {p?.chapterTitle ?? `Chapter ${loc.chapter}`}
                      </p>
                    </div>
                    <div className="relative z-10 flex shrink-0 items-center gap-2">
                      <GradeBadge status={p?.status} size="xs" />
                      <button
                        onClick={() => remove(row)}
                        className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted hover:border-rose-300 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {p ? (
                    <>
                      {p.arabic && (
                        <p dir="rtl" lang="ar" className="mt-3 text-right font-arabic text-lg leading-loose text-teal-dark line-clamp-2">
                          {p.arabic}
                        </p>
                      )}
                      {p.translation && (
                        <p dir="auto" className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                          {p.translation}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 h-10 animate-pulse rounded-lg bg-bg" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
