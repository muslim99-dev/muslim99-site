import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { restoreStreak, safeTz } from "@/lib/streak";

export const dynamic = "force-dynamic";

/** Spends restore credits to bring back a streak that broke today. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { tz } = await req.json().catch(() => ({}));
  try {
    const result = await restoreStreak(id, safeTz(tz));
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.view);
  } catch (err) {
    console.error("streak restore failed", err);
    return NextResponse.json({ error: "Couldn't restore your streak right now." }, { status: 503 });
  }
}
