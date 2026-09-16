import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { type, refId, folder } = await req.json().catch(() => ({}));
  if (!type || !refId) {
    return NextResponse.json({ error: "type and refId are required." }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_type_refId: { userId, type, refId } },
    update: { folder: folder || undefined },
    create: { userId, type, refId, folder: folder || "My Favorites" }
  });
  return NextResponse.json({ bookmark });
}

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { type, refId } = await req.json().catch(() => ({}));
  if (!type || !refId) {
    return NextResponse.json({ error: "type and refId are required." }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({ where: { userId, type, refId } });
  return NextResponse.json({ ok: true });
}
