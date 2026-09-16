import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TOTAL_PAGES = 604;

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const khatmah = await prisma.khatmah.findFirst({
    where: { userId, status: "active" },
    orderBy: { startDate: "desc" }
  });
  return NextResponse.json({ khatmah, totalPages: TOTAL_PAGES });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { targetDays } = await req.json().catch(() => ({}));
  if (typeof targetDays !== "number" || targetDays < 1) {
    return NextResponse.json({ error: "targetDays must be a positive number." }, { status: 400 });
  }

  await prisma.khatmah.updateMany({ where: { userId, status: "active" }, data: { status: "abandoned" } });
  const khatmah = await prisma.khatmah.create({ data: { userId, targetDays } });
  return NextResponse.json({ khatmah, totalPages: TOTAL_PAGES });
}

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id, pagesRead } = await req.json().catch(() => ({}));
  if (!id || typeof pagesRead !== "number") {
    return NextResponse.json({ error: "id and pagesRead are required." }, { status: 400 });
  }

  const existing = await prisma.khatmah.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Khatmah not found." }, { status: 404 });

  const clamped = Math.max(0, Math.min(TOTAL_PAGES, pagesRead));
  const khatmah = await prisma.khatmah.update({
    where: { id },
    data: {
      pagesRead: clamped,
      status: clamped >= TOTAL_PAGES ? "completed" : "active",
      completedAt: clamped >= TOTAL_PAGES ? new Date() : null
    }
  });
  return NextResponse.json({ khatmah, totalPages: TOTAL_PAGES });
}
