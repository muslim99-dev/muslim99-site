import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/analytics";
import { getAnalytics, isRange, safeTimeZone } from "@/lib/analyticsStats";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isAdminEmail(session.user.email)) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const range = req.nextUrl.searchParams.get("range");
  try {
    const data = await getAnalytics(isRange(range) ? range : "24h", safeTimeZone(req.nextUrl.searchParams.get("tz")));
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("analytics stats failed", err);
    return NextResponse.json({ error: "Couldn't load analytics. Has the database schema been pushed?" }, { status: 500 });
  }
}
