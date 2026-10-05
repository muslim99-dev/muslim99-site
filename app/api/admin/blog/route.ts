import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { parseBlogInput } from "@/lib/blogFormat";

export const dynamic = "force-dynamic";

/** Every post (drafts included) for the admin list. */
export async function GET() {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      featured: true,
      category: true,
      views: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true
    },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ posts }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const parsed = parseBlogInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { data } = parsed;
  if (await prisma.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } })) {
    return NextResponse.json({ error: `The URL /blog/${data.slug} is already used by another post — change the slug.` }, { status: 409 });
  }
  const post = await prisma.blogPost.create({
    data: { ...data, publishedAt: data.status === "PUBLISHED" ? new Date() : null }
  });
  return NextResponse.json({ post }, { status: 201 });
}
