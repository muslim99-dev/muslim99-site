import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { parseBlogInput } from "@/lib/blogFormat";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json({ post }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const existing = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { id: true, publishedAt: true } });
  if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const parsed = parseBlogInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { data } = parsed;
  const clash = await prisma.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (clash && clash.id !== existing.id) {
    return NextResponse.json({ error: `The URL /blog/${data.slug} is already used by another post — change the slug.` }, { status: 409 });
  }
  const post = await prisma.blogPost.update({
    where: { id: existing.id },
    // The first publish sets the date; later edits and unpublish/republish keep it.
    data: { ...data, publishedAt: data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt }
  });
  return NextResponse.json({ post });
}

/** Quick actions from the post list: publish / unpublish / feature. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { status?: string; featured?: boolean };
  const existing = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { publishedAt: true, content: true } });
  if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const data: { status?: "DRAFT" | "PUBLISHED"; featured?: boolean; publishedAt?: Date } = {};
  if (body.status === "PUBLISHED" || body.status === "DRAFT") {
    if (body.status === "PUBLISHED" && existing.content.trim().length < 20) {
      return NextResponse.json({ error: "Write some content before publishing." }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
  }
  if (typeof body.featured === "boolean") data.featured = body.featured;
  const post = await prisma.blogPost.update({ where: { id: params.id }, data });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  await prisma.blogPost.deleteMany({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
