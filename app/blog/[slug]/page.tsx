import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import JsonLd from "@/components/JsonLd";
import PostCard from "@/components/blog/PostCard";
import { ShareButtons, ViewTracker } from "@/components/blog/ArticleClient";
import { Breadcrumbs } from "@/components/hadith/HadithUI";
import { getPublishedPost, getRelatedPosts } from "@/lib/blog";
import { formatDate, headingsOf, readingTime, renderMarkdown } from "@/lib/blogFormat";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const loadPost = cache((slug: string) => getPublishedPost(slug).catch(() => null));

const fullUrl = (src: string) => (src.startsWith("/") ? absoluteUrl(src) : src);

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await loadPost(params.slug);
  if (!post) return { title: `Article not found | ${SITE_NAME}`, robots: { index: false } };
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const images = post.coverImage ? [{ url: fullUrl(post.coverImage), alt: post.coverAlt || post.title }] : undefined;
  return {
    title: `${title} | ${SITE_NAME} Blog`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    authors: [{ name: post.authorName }],
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      section: post.category,
      tags: post.tags,
      ...(images && { images })
    },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, ...(images && { images: images.map((i) => i.url) }) }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await loadPost(params.slug);
  if (!post) notFound();

  const [related] = await Promise.all([getRelatedPosts(post).catch(() => [])]);
  const html = renderMarkdown(post.content);
  const toc = headingsOf(post.content);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const minutes = readingTime(post.content);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      ...(post.coverImage && { image: [fullUrl(post.coverImage)] }),
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: { "@type": "Person", name: post.authorName },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: post.category,
      keywords: post.tags.join(", "),
      wordCount: post.content.split(/\s+/).filter(Boolean).length,
      timeRequired: `PT${minutes}M`
    }
  ];

  return (
    <div>
      <JsonLd data={jsonLd} />
      <ViewTracker slug={post.slug} />

      <article>
        {/* Header */}
        <header className="mx-auto max-w-3xl px-5 pt-8 lg:px-0">
          <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` }, { label: post.title }]} />
          <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="mt-6 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-gold hover:underline">
            {post.category}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-teal-dark sm:text-[2.6rem] sm:leading-[1.15]">{post.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-sm font-semibold text-white" aria-hidden>
                {post.authorName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="text-sm">
                <p className="font-medium text-teal-dark">{post.authorName}</p>
                <p className="text-muted">
                  <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time> · {minutes} min read
                </p>
              </div>
            </div>
            <ShareButtons url={url} title={post.title} />
          </div>
        </header>

        {post.coverImage && (
          <figure className="mx-auto mt-8 max-w-5xl px-5 lg:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.coverAlt || post.title} className="aspect-[16/9] w-full rounded-card object-cover shadow-card" />
          </figure>
        )}

        {/* Body */}
        <div className="mx-auto mt-10 grid max-w-app gap-10 px-5 lg:grid-cols-[1fr_minmax(0,720px)_1fr] lg:px-8">
          <div className="hidden lg:block" />
          <div className="min-w-0">
            {toc.length >= 3 && (
              <nav className="mb-8 rounded-card border border-border bg-white p-5 xl:hidden" aria-label="In this article">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">In this article</p>
                <ol className="mt-3 space-y-1.5 text-sm">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                      <a href={`#${h.id}`} className="text-teal-dark hover:text-primary-deep">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog?q=${encodeURIComponent(t)}`} className="rounded-full bg-aqua px-3 py-1 text-xs font-medium text-primary-deep hover:bg-primary hover:text-white">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-4 rounded-card border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-teal-dark">Found this beneficial?</p>
                <p className="text-sm text-muted">Share it — the one who guides to good gets its reward.</p>
              </div>
              <ShareButtons url={url} title={post.title} />
            </div>
          </div>
          {toc.length >= 3 ? (
            <aside className="hidden xl:block">
              <nav className="sticky top-24 text-sm" aria-label="In this article">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">In this article</p>
                <ol className="mt-3 space-y-2 border-l border-border">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-7" : "pl-4"}>
                      <a href={`#${h.id}`} className="block leading-snug text-muted hover:text-primary-deep">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-border bg-white">
          <div className="mx-auto max-w-app px-5 py-14 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold text-teal-dark">Keep reading</h2>
              <Link href="/blog" className="text-sm font-medium text-primary-deep hover:underline">
                All articles →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
