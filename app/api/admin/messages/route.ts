import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function guard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isAdminEmail(session.user.email)) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  return null;
}

/** Contact-form inbox for the admin account only. */
export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const [messages, unread] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.contactMessage.count({ where: { read: false } })
  ]);
  return NextResponse.json({ messages, unread }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const { id, read } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || typeof read !== "boolean") return NextResponse.json({ error: "id and read are required." }, { status: 400 });
  await prisma.contactMessage.updateMany({ where: { id }, data: { read } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string") return NextResponse.json({ error: "id is required." }, { status: 400 });
  await prisma.contactMessage.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
