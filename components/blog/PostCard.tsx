import Link from "next/link";
import type { BlogListItem } from "@/lib/blog";
import { formatDate, readingTime } from "@/lib/blogFormat";

function Cover({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-teal-dark to-primary-deep ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <span dir="rtl" className="font-quran text-3xl text-white/25">
            مسلم ٩٩
          </span>
        </div>
      )}
    </div>
  );
}

export function PostMeta({ post }: { post: Pick<BlogListItem, "publishedAt" | "content"> }) {
  return (
    <span className="text-xs text-muted">
      {formatDate(post.publishedAt)} · {readingTime(post.content)} min read
    </span>
  );
}

export default function PostCard({ post }: { post: BlogListItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <Cover src={post.coverImage} alt={post.coverAlt || post.title} className="aspect-[16/9]" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold hover:underline">
          {post.category}
        </Link>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-teal-dark">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary-deep">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-auto pt-4">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}

export function FeaturedPostCard({ post }: { post: BlogListItem }) {
  return (
    <article className="group grid overflow-hidden rounded-card border border-border bg-white shadow-sm transition-shadow hover:shadow-card lg:grid-cols-[1.25fr_1fr]">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <Cover src={post.coverImage} alt={post.coverAlt || post.title} className="aspect-[16/9] h-full lg:aspect-auto lg:min-h-[340px]" />
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#9A7B1C]">Featured</span>
          <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-deep hover:underline">
            {post.category}
          </Link>
        </div>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-teal-dark sm:text-3xl">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary-deep">
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-4 leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm text-teal-dark">
            {post.authorName} <span className="text-muted">· </span>
            <PostMeta post={post} />
          </span>
          <Link href={`/blog/${post.slug}`} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep">
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}
