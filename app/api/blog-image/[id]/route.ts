import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Serves an image uploaded from the blog editor. An upload never changes
 * (a new upload gets a new id), so it's cached for a year. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const image = await prisma.blogImage.findUnique({ where: { id: params.id } }).catch(() => null);
  if (!image) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(image.data, {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
