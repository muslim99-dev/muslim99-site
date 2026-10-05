import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Counts a read. The article page calls this once per browser session. */
export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  await prisma.blogPost
    .updateMany({ where: { slug: params.slug, status: "PUBLISHED" }, data: { views: { increment: 1 } } })
    .catch(() => null);
  return new NextResponse(null, { status: 204 });
}
