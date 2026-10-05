import Link from "next/link";
import { getBlogCategories, getFeaturedPost, getPublishedPosts } from "@/lib/blog";
import PostCard, { FeaturedPostCard } from "@/components/blog/PostCard";
import { PageHero } from "@/components/hadith/HadithUI";
import { SITE_NAME } from "@/lib/site";

// Rendered on every request from the database — new posts appear instantly.
export const dynamic = "force-dynamic";

type Search = { category?: string; q?: string; page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Search }) {
  const page = Number(searchParams.page) || 1;
  const cat = searchParams.category;
  return {
    title: `${cat ? `${cat} — ` : ""}Blog${page > 1 ? ` (page ${page})` : ""} | ${SITE_NAME}`,
    description:
      "Articles from Muslim99 on the Quran, Hadith, Tafsir, duas, prayer and Islamic history — plus news about new features on the platform.",
    alternates: { canonical: cat ? `/blog?category=${encodeURIComponent(cat)}` : page > 1 ? `/blog?page=${page}` : "/blog" },
    // Search result pages aren't worth indexing.
    ...(searchParams.q && { robots: { index: false, follow: true } })
  };
}

export default async function BlogPage({ searchParams }: { searchParams: Search }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const category = searchParams.category?.slice(0, 60) || undefined;
  const q = searchParams.q?.trim().slice(0, 100) || undefined;
  const filtered = !!(category || q);

  let data: Awaited<ReturnType<typeof getPublishedPosts>> | null = null;
  let featured: Awaited<ReturnType<typeof getFeaturedPost>> = null;
  let categories: Awaited<ReturnType<typeof getBlogCategories>> = [];
  try {
    [data, featured, categories] = await Promise.all([
      getPublishedPosts({ page, category, q }),
      !filtered && page === 1 ? getFeaturedPost() : Promise.resolve(null),
      getBlogCategories()
    ]);
  } catch {
    data = null;
  }

  const posts = (data?.posts ?? []).filter((p) => p.id !== featured?.id);
  const href = (p: Record<string, string | number | undefined>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== "" && !(k === "page" && v === 1)) s.set(k, String(v));
    const qs = s.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-app px-5 py-8 sm:py-10 lg:px-8">
      <PageHero
        eyebrow="Muslim99 Blog"
        title="Insights on the Quran & Sunnah"
        subtitle="Articles on the Quran, Hadith, Tafsir, duas, prayer and Islamic history — and the latest from the Muslim99 team."
        arabic="مقالات إسلامية"
      >
        <form action="/blog" className="relative max-w-xl">
          {category && <input type="hidden" name="category" value={category} />}
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-28 text-sm text-teal-dark shadow-sm outline-none ring-2 ring-transparent focus:ring-gold/60"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep">Search</button>
        </form>
      </PageHero>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
          <Link
            href={href({ q })}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!category ? "bg-teal-dark text-white" : "border border-border bg-white text-teal-dark hover:border-primary"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={href({ category: c.category, q })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c.category ? "bg-teal-dark text-white" : "border border-border bg-white text-teal-dark hover:border-primary"
              }`}
            >
              {c.category} <span className="opacity-60">{c.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {data === null ? (
        <div className="mt-10 rounded-card border border-border bg-white p-10 text-center">
          <p className="font-medium text-teal-dark">Couldn&apos;t load the blog right now.</p>
          <p className="mt-1 text-sm text-muted">Please try again in a moment.</p>
        </div>
      ) : data.total === 0 ? (
        <div className="mt-10 rounded-card border border-border bg-white p-12 text-center">
          <p className="text-lg font-semibold text-teal-dark">{filtered ? "No articles found" : "Articles are coming soon"}</p>
          <p className="mt-1 text-sm text-muted">
            {filtered ? "Try a different search or category." : "The Muslim99 team is writing the first posts — check back soon, in sha Allah."}
          </p>
          {filtered && (
            <Link href="/blog" className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep">
              View all articles
            </Link>
          )}
        </div>
      ) : (
        <>
          {filtered && (
            <p className="mt-6 text-sm text-muted">
              {data.total} article{data.total === 1 ? "" : "s"}
              {q && <> for “<span className="font-medium text-teal-dark">{q}</span>”</>}
              {category && <> in <span className="font-medium text-teal-dark">{category}</span></>} ·{" "}
              <Link href="/blog" className="font-medium text-primary-deep hover:underline">
                Clear
              </Link>
            </p>
          )}

          {featured && (
            <div className="mt-6">
              <FeaturedPostCard post={featured} />
            </div>
          )}

          {posts.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}

          {data.pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pages">
              {page > 1 && (
                <Link href={href({ category, q, page: page - 1 })} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-teal-dark hover:border-primary">
                  ← Newer
                </Link>
              )}
              {Array.from({ length: data.pages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === data!.pages || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1.5">
                    {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
                    <Link
                      href={href({ category, q, page: n })}
                      aria-current={n === page ? "page" : undefined}
                      className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-medium ${n === page ? "bg-teal-dark text-white" : "border border-border bg-white text-teal-dark hover:border-primary"}`}
                    >
                      {n}
                    </Link>
                  </span>
                ))}
              {page < data.pages && (
                <Link href={href({ category, q, page: page + 1 })} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-teal-dark hover:border-primary">
                  Older →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
