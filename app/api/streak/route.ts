import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIn, getStreak, safeTz } from "@/lib/streak";

export const dynamic = "force-dynamic";

async function userId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

/** The signed-in user's streak (no check-in). */
export async function GET(req: NextRequest) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    return NextResponse.json(await getStreak(id, safeTz(req.nextUrl.searchParams.get("tz"))), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("streak read failed", err);
    return NextResponse.json({ error: "Couldn't load your streak." }, { status: 503 });
  }
}

/** Daily check-in — called when a signed-in user opens the site. */
export async function POST(req: NextRequest) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { tz } = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(await checkIn(id, safeTz(tz)), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("streak check-in failed", err);
    return NextResponse.json({ error: "Couldn't update your streak." }, { status: 503 });
  }
}
