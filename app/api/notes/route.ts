import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const refType = searchParams.get("refType");
  const refId = searchParams.get("refId");

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(refType ? { refType: refType as never } : {}),
      ...(refId ? { refId } : {})
    },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { refType, refId, content, tags } = await req.json().catch(() => ({}));
  if (!refType || !refId || !content) {
    return NextResponse.json({ error: "refType, refId and content are required." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: { userId, refType, refId, content, tags: Array.isArray(tags) ? tags : [] }
  });
  return NextResponse.json({ note });
}

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  await prisma.note.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
