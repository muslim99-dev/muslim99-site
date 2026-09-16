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

  const progress = await prisma.readingProgress.findUnique({ where: { userId } });
  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { surah, ayah } = await req.json().catch(() => ({}));
  if (typeof surah !== "number" || typeof ayah !== "number") {
    return NextResponse.json({ error: "surah and ayah must be numbers." }, { status: 400 });
  }

  const progress = await prisma.readingProgress.upsert({
    where: { userId },
    update: { surah, ayah },
    create: { userId, surah, ayah }
  });
  return NextResponse.json({ progress });
}
