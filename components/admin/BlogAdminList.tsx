"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/blogFormat";

type Row = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  category: string;
  views: number;
  coverImage: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

type Filter = "all" | "PUBLISHED" | "DRAFT";

export default function BlogAdminList() {
  const [posts, setPosts] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load posts.");
      setPosts(data.posts);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    const res = await fetch(`/api/admin/blog/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return alert(data.error || "Couldn't update the post.");
    load();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete “${row.title}”? This can't be undone.`)) return;
    setBusy(row.id);
    const res = await fetch(`/api/admin/blog/${row.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) return alert("Couldn't delete the post.");
    setPosts((p) => p?.filter((x) => x.id !== row.id) ?? null);
  }

  const counts = useMemo(() => {
    const list = posts ?? [];
    return {
      all: list.length,
      PUBLISHED: list.filter((p) => p.status === "PUBLISHED").length,
      DRAFT: list.filter((p) => p.status === "DRAFT").length,
      views: list.reduce((n, p) => n + p.views, 0)
    };
  }, [posts]);

  const q = query.trim().toLowerCase();
  const shown = (posts ?? []).filter(
    (p) => (filter === "all" || p.status === filter) && (!q || `${p.title} ${p.category} ${p.slug}`.toLowerCase().includes(q))
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Total posts", counts.all],
          ["Published", counts.PUBLISHED],
          ["Drafts", counts.DRAFT],
          ["Total views", counts.views.toLocaleString()]
        ].map(([label, value]) => (
          <div key={label} className="rounded-card border border-border bg-white p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-teal-dark">{posts ? value : "—"}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full border border-border bg-white p-1 text-sm">
          {(["all", "PUBLISHED", "DRAFT"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${filter === f ? "bg-teal-dark text-white" : "text-muted hover:text-teal-dark"}`}
            >
              {f === "all" ? "All" : f === "PUBLISHED" ? "Published" : "Drafts"} <span className="opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary sm:w-60"
          />
          <Link
            href="/admin/blog/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            <span aria-hidden className="text-base leading-none">+</span> New post
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-card border border-border bg-white">
        {error ? (
          <p className="p-6 text-sm text-rose-600">{error}</p>
        ) : !posts ? (
          <p className="p-6 text-sm text-muted">Loading posts…</p>
        ) : shown.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-teal-dark">{posts.length === 0 ? "No posts yet" : "No posts match"}</p>
            {posts.length === 0 && (
              <>
                <p className="mt-1 text-sm text-muted">Write your first article for the Muslim99 blog.</p>
                <Link href="/admin/blog/new" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
                  Write a post
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {shown.map((p) => (
              <li key={p.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${busy === p.id ? "opacity-50" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-aqua">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.coverImage && <img src={p.coverImage} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/blog/${p.id}`} className="line-clamp-1 font-medium text-teal-dark hover:text-primary-deep">
                      {p.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${
                          p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {p.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                      {p.featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 font-semibold text-[#9A7B1C]">Featured</span>}
                      <span>{p.category}</span>
                      <span>·</span>
                      <span>{p.publishedAt ? formatDate(p.publishedAt) : `Edited ${formatDate(p.updatedAt)}`}</span>
                      <span>·</span>
                      <span>{p.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5 text-xs">
                  <Link href={`/admin/blog/${p.id}`} className="rounded-full border border-border px-3 py-1.5 font-medium text-teal-dark hover:border-primary">
                    Edit
                  </Link>
                  {p.status === "PUBLISHED" && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 font-medium text-teal-dark hover:border-primary">
                      View
                    </a>
                  )}
                  <button
                    onClick={() => patch(p.id, { status: p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })}
                    disabled={!!busy}
                    className="rounded-full border border-border px-3 py-1.5 font-medium text-teal-dark hover:border-primary"
                  >
                    {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => patch(p.id, { featured: !p.featured })}
                    disabled={!!busy}
                    className="rounded-full border border-border px-3 py-1.5 font-medium text-teal-dark hover:border-primary"
                  >
                    {p.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    onClick={() => remove(p)}
                    disabled={!!busy}
                    className="rounded-full border border-rose-200 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
