/**
 * Blog data access (server-only). Posts are written in the admin panel
 * (/admin/blog) and read live from the database on every request.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { BLOG_PAGE_SIZE } from "./blogFormat";

const LIST_FIELDS = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  coverAlt: true,
  category: true,
  tags: true,
  featured: true,
  authorName: true,
  publishedAt: true,
  views: true,
  content: true
} satisfies Prisma.BlogPostSelect;

export type BlogListItem = Prisma.BlogPostGetPayload<{ select: typeof LIST_FIELDS }>;

/** Evaluated per query — "now" must not be frozen at module load. */
const published = () => ({ status: "PUBLISHED" as const, publishedAt: { lte: new Date() } });

export async function getPublishedPosts({ page = 1, category, q }: { page?: number; category?: string; q?: string }) {
  const where: Prisma.BlogPostWhereInput = {
    ...published(),
    ...(category && { category }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } }
      ]
    })
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: LIST_FIELDS,
      orderBy: [{ publishedAt: "desc" }],
      skip: (Math.max(page, 1) - 1) * BLOG_PAGE_SIZE,
      take: BLOG_PAGE_SIZE
    }),
    prisma.blogPost.count({ where })
  ]);
  return { posts, total, pages: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)) };
}

export async function getFeaturedPost() {
  return prisma.blogPost.findFirst({ where: { ...published(), featured: true }, select: LIST_FIELDS, orderBy: { publishedAt: "desc" } });
}

/** Categories that have at least one published post, with counts. */
export async function getBlogCategories() {
  const rows = await prisma.blogPost.groupBy({ by: ["category"], where: published(), _count: { _all: true } });
  return rows.map((r) => ({ category: r.category, count: r._count._all })).sort((a, b) => b.count - a.count);
}

export async function getPublishedPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, ...published() } });
}

export async function getRelatedPosts(post: { id: string; category: string; tags: string[] }, take = 3) {
  const related = await prisma.blogPost.findMany({
    where: { ...published(), id: { not: post.id }, OR: [{ category: post.category }, { tags: { hasSome: post.tags } }] },
    select: LIST_FIELDS,
    orderBy: { publishedAt: "desc" },
    take
  });
  if (related.length >= take) return related;
  const more = await prisma.blogPost.findMany({
    where: { ...published(), id: { notIn: [post.id, ...related.map((r) => r.id)] } },
    select: LIST_FIELDS,
    orderBy: { publishedAt: "desc" },
    take: take - related.length
  });
  return [...related, ...more];
}

export async function getRecentPosts(take = 3) {
  return prisma.blogPost.findMany({ where: published(), select: LIST_FIELDS, orderBy: { publishedAt: "desc" }, take });
}

export async function getSitemapPosts() {
  return prisma.blogPost.findMany({ where: published(), select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } });
}
