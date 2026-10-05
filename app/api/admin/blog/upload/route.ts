import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Image upload from the blog editor (cover or inline). Returns its public URL. */
export async function POST(req: NextRequest) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be 3 MB or smaller." }, { status: 400 });
  const image = await prisma.blogImage.create({
    data: { mime: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()) },
    select: { id: true }
  });
  return NextResponse.json({ url: `/api/blog-image/${image.id}` }, { status: 201 });
}
