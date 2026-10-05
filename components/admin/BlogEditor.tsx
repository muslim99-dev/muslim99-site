"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BLOG_CATEGORIES, readingTime, renderMarkdown, slugify } from "@/lib/blogFormat";
import { SITE_URL } from "@/lib/site";

export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  views: number;
};

type Form = Omit<EditablePost, "id" | "publishedAt" | "views" | "coverImage" | "coverAlt" | "metaTitle" | "metaDescription" | "tags"> & {
  coverImage: string;
  coverAlt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string;
};

const toForm = (p: EditablePost | null, author: string): Form => ({
  slug: p?.slug ?? "",
  title: p?.title ?? "",
  excerpt: p?.excerpt ?? "",
  content: p?.content ?? "",
  coverImage: p?.coverImage ?? "",
  coverAlt: p?.coverAlt ?? "",
  category: p?.category ?? "General",
  tags: (p?.tags ?? []).join(", "),
  status: p?.status ?? "DRAFT",
  featured: p?.featured ?? false,
  authorName: p?.authorName ?? author,
  metaTitle: p?.metaTitle ?? "",
  metaDescription: p?.metaDescription ?? ""
});

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/blog/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data.url as string;
}

const label = "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted";
const input = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-teal-dark outline-none transition-colors focus:border-primary";

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-teal-dark">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-[11px] tabular-nums ${n > max ? "text-rose-600" : "text-muted"}`}>{n}/{max}</span>;
}

export default function BlogEditor({ post, defaultAuthor }: { post: EditablePost | null; defaultAuthor: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => toForm(post, defaultAuthor));
  const [saved, setSaved] = useState<Form>(() => toForm(post, defaultAuthor));
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [mode, setMode] = useState<"write" | "preview" | "split">("write");
  const [saving, setSaving] = useState<null | "DRAFT" | "PUBLISHED">(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState<"cover" | "inline" | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const inlineFileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function setTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  }

  const save = useCallback(
    async (status: "DRAFT" | "PUBLISHED") => {
      setSaving(status);
      setMessage(null);
      const payload = { ...form, status, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      try {
        const res = await fetch(post ? `/api/admin/blog/${post.id}` : "/api/admin/blog", {
          method: post ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Couldn't save the post.");
        const next = toForm(data.post, defaultAuthor);
        setForm(next);
        setSaved(next);
        setMessage({ kind: "ok", text: status === "PUBLISHED" ? "Published — the post is live." : "Draft saved." });
        if (!post) router.replace(`/admin/blog/${data.post.id}`);
        else router.refresh();
      } catch (e) {
        setMessage({ kind: "error", text: (e as Error).message });
      } finally {
        setSaving(null);
      }
    },
    [form, post, router, defaultAuthor]
  );

  // Ctrl/Cmd + S saves (keeps the current status).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) save(form.status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving, form.status]);

  /** Wraps the selection (or inserts a placeholder) in the content textarea. */
  function format(before: string, after = "", placeholder = "text", linePrefix = false) {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    let insert: string;
    if (linePrefix) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const chunk = value.slice(lineStart, e) || placeholder;
      insert = chunk
        .split("\n")
        .map((l, i) => (before === "1. " ? `${i + 1}. ` : before) + l)
        .join("\n");
      const next = value.slice(0, lineStart) + insert + value.slice(e);
      set("content", next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(lineStart, lineStart + insert.length);
      });
      return;
    }
    const sel = value.slice(s, e) || placeholder;
    insert = before + sel + after;
    set("content", value.slice(0, s) + insert + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  async function insertImage(file: File) {
    setUploading("inline");
    try {
      const url = await uploadImage(file);
      const alt = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
      format(`![${alt}](${url})\n`, "", "", false);
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    } finally {
      setUploading(null);
    }
  }

  async function uploadCover(file: File) {
    setUploading("cover");
    try {
      set("coverImage", await uploadImage(file));
      if (!form.coverAlt) set("coverAlt", form.title);
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    } finally {
      setUploading(null);
    }
  }

  const html = useMemo(() => (mode === "write" ? "" : renderMarkdown(form.content)), [form.content, mode]);
  const words = form.content.split(/\s+/).filter(Boolean).length;
  const isLive = saved.status === "PUBLISHED";
  const seoTitle = form.metaTitle || form.title || "Post title";
  const seoDesc = form.metaDescription || form.excerpt || "The post's excerpt is shown here in search results.";

  const tools: { label: string; title: string; run: () => void }[] = [
    { label: "H2", title: "Heading", run: () => format("## ", "", "Heading", true) },
    { label: "H3", title: "Sub-heading", run: () => format("### ", "", "Sub-heading", true) },
    { label: "B", title: "Bold", run: () => format("**", "**") },
    { label: "I", title: "Italic", run: () => format("_", "_") },
    { label: "🔗", title: "Link", run: () => format("[", "](https://)", "link text") },
    { label: "❝", title: "Quote", run: () => format("> ", "", "Quote", true) },
    { label: "•", title: "Bulleted list", run: () => format("- ", "", "List item", true) },
    { label: "1.", title: "Numbered list", run: () => format("1. ", "", "List item", true) },
    { label: "—", title: "Divider", run: () => format("\n---\n", "", "", false) }
  ];

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-16 z-20 -mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/95 px-5 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <Link href="/admin/blog" className="font-medium text-primary-deep hover:underline">
            ← All posts
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isLive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
            {isLive ? "Published" : post ? "Draft" : "New draft"}
          </span>
          {dirty && <span className="text-xs text-muted">Unsaved changes</span>}
          {message && (
            <span className={`truncate text-xs font-medium ${message.kind === "ok" ? "text-emerald-700" : "text-rose-600"}`} role="status">
              {message.text}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isLive && post && (
            <a href={`/blog/${saved.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-teal-dark hover:border-primary">
              View post ↗
            </a>
          )}
          <button
            onClick={() => save("DRAFT")}
            disabled={!!saving}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-teal-dark hover:border-primary disabled:opacity-60"
          >
            {saving === "DRAFT" ? "Saving…" : isLive ? "Unpublish (draft)" : "Save draft"}
          </button>
          <button
            onClick={() => save("PUBLISHED")}
            disabled={!!saving}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-deep disabled:opacity-60"
          >
            {saving === "PUBLISHED" ? "Publishing…" : isLive ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-5">
          <section className="rounded-card border border-border bg-white p-4 sm:p-6">
            <input
              value={form.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              aria-label="Title"
              className="w-full border-0 bg-transparent text-2xl font-semibold text-teal-dark outline-none placeholder:text-muted/60 sm:text-3xl"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted">
              <span>{SITE_URL.replace(/^https?:\/\//, "")}/blog/</span>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value) || e.target.value.toLowerCase());
                }}
                aria-label="URL slug"
                placeholder="post-url"
                className="min-w-[10rem] flex-1 rounded-md border border-transparent bg-bg px-2 py-1 font-medium text-teal-dark outline-none focus:border-primary"
              />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="excerpt" className={label}>
                  Excerpt
                </label>
                <Counter n={form.excerpt.length} max={300} />
              </div>
              <textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="A one- or two-sentence summary shown on the blog page and in search results."
                className={`${input} mt-1.5 resize-y`}
              />
            </div>
          </section>

          {/* Content editor */}
          <section className="overflow-hidden rounded-card border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg/60 px-3 py-2">
              <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Formatting">
                {tools.map((t) => (
                  <button
                    key={t.title}
                    type="button"
                    title={t.title}
                    aria-label={t.title}
                    onClick={t.run}
                    disabled={mode === "preview"}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-sm text-teal-dark hover:bg-white disabled:opacity-40 ${t.label === "B" ? "font-bold" : t.label === "I" ? "italic" : ""}`}
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  title="Insert image"
                  onClick={() => inlineFileRef.current?.click()}
                  disabled={mode === "preview" || uploading === "inline"}
                  className="flex h-8 items-center gap-1 rounded-lg px-2 text-sm text-teal-dark hover:bg-white disabled:opacity-40"
                >
                  🖼 {uploading === "inline" ? "Uploading…" : "Image"}
                </button>
                <input
                  ref={inlineFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) insertImage(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="inline-flex rounded-full border border-border bg-white p-0.5 text-xs">
                {(["write", "split", "preview"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-full px-3 py-1 font-medium capitalize ${mode === m ? "bg-teal-dark text-white" : "text-muted"} ${m === "split" ? "hidden xl:block" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className={mode === "split" ? "grid xl:grid-cols-2" : ""}>
              {mode !== "preview" && (
                <textarea
                  ref={textRef}
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  aria-label="Content (Markdown)"
                  placeholder={"Write your post here…\n\n## A heading\n\nParagraphs, **bold**, _italic_, [links](https://…), lists and > quotes are supported.\nArabic and Urdu paragraphs display right-to-left automatically."}
                  className={`block min-h-[520px] w-full resize-y border-0 p-5 font-mono text-[14px] leading-7 text-teal-dark outline-none ${mode === "split" ? "xl:border-r xl:border-border" : ""}`}
                />
              )}
              {mode !== "write" && (
                <div className="min-h-[520px] overflow-y-auto p-5 sm:p-7">
                  {form.content.trim() ? (
                    <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
                  ) : (
                    <p className="text-sm text-muted">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-border px-4 py-2 text-[11px] text-muted">
              <span>Markdown · Ctrl+S to save</span>
              <span>
                {words.toLocaleString()} words · {readingTime(form.content)} min read
              </span>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Card title="Cover image">
            {form.coverImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImage} alt={form.coverAlt} className="aspect-[16/9] w-full rounded-xl object-cover" />
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-full border border-border py-1.5 text-center text-xs font-medium text-teal-dark hover:border-primary">
                    {uploading === "cover" ? "Uploading…" : "Replace"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                  </label>
                  <button onClick={() => set("coverImage", "")} className="flex-1 rounded-full border border-rose-200 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-bg text-center text-sm text-muted transition-colors hover:border-primary hover:text-primary-deep">
                <span className="text-2xl" aria-hidden>
                  ⬆
                </span>
                {uploading === "cover" ? "Uploading…" : "Upload image"}
                <span className="text-[11px]">JPG, PNG, WebP · up to 3 MB · 1200×675 ideal</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
              </label>
            )}
            <input value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="…or paste an image URL" className={`${input} mt-2 text-xs`} />
            <input value={form.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} placeholder="Alt text (describe the image)" className={`${input} mt-2 text-xs`} />
          </Card>

          <Card title="Details">
            <div className="space-y-3">
              <div>
                <label htmlFor="category" className={label}>
                  Category
                </label>
                <input id="category" list="blog-categories" value={form.category} onChange={(e) => set("category", e.target.value)} className={`${input} mt-1.5`} />
                <datalist id="blog-categories">
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="tags" className={label}>
                  Tags
                </label>
                <input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="ramadan, fasting, duas" className={`${input} mt-1.5`} />
                {form.tags.trim() && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {form.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span key={t} className="rounded-full bg-aqua px-2 py-0.5 text-[11px] font-medium text-primary-deep">
                          #{t}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="author" className={label}>
                  Author
                </label>
                <input id="author" value={form.authorName} onChange={(e) => set("authorName", e.target.value)} className={`${input} mt-1.5`} />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm text-teal-dark">
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                Feature at the top of the blog
              </label>
            </div>
          </Card>

          <Card title="SEO">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="mt" className={label}>
                    Meta title
                  </label>
                  <Counter n={form.metaTitle.length} max={60} />
                </div>
                <input id="mt" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} placeholder="Defaults to the post title" className={`${input} mt-1.5`} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="md" className={label}>
                    Meta description
                  </label>
                  <Counter n={form.metaDescription.length} max={160} />
                </div>
                <textarea id="md" rows={3} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} placeholder="Defaults to the excerpt" className={`${input} mt-1.5 resize-y`} />
              </div>
              <div className="rounded-xl bg-bg p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Google preview</p>
                <p className="mt-1.5 truncate text-[11px] text-[#202124]">themuslim99.com › blog › {form.slug || "post-url"}</p>
                <p className="mt-0.5 line-clamp-1 text-[15px] text-[#1a0dab]">{seoTitle} | Muslim99 Blog</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#4d5156]">{seoDesc}</p>
              </div>
            </div>
          </Card>

          {post && (
            <p className="px-1 text-xs text-muted">
              {post.views.toLocaleString()} views
              {post.publishedAt && ` · first published ${new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
