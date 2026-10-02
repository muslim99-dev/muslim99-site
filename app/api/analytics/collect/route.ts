import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanPath, isBot, parseUserAgent, referrerHost, sectionOf } from "@/lib/analytics";

const ID = /^[a-zA-Z0-9-]{8,64}$/;

/** Receives page views ("view") and heartbeats ("ping") from AnalyticsTracker.
 * Always answers 204 — analytics must never break or slow the site. */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (isBot(ua)) return new NextResponse(null, { status: 204 });

    const body = await req.json().catch(() => null);
    const path = cleanPath(body?.path);
    const { visitorId, sessionId, type } = body ?? {};
    if (!path || !ID.test(visitorId ?? "") || !ID.test(sessionId ?? "") || (type !== "view" && type !== "ping")) {
      return new NextResponse(null, { status: 204 });
    }
    if (path.startsWith("/admin") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });

    const { device, browser, os } = parseUserAgent(ua);
    const country = req.headers.get("x-vercel-ip-country") || null;
    const cityRaw = req.headers.get("x-vercel-ip-city");
    const city = cityRaw ? decodeURIComponent(cityRaw).slice(0, 80) : null;

    if (type === "view") {
      const session = await getServerSession(authOptions).catch(() => null);
      await prisma.pageView.create({
        data: {
          visitorId,
          sessionId,
          path,
          section: sectionOf(path),
          referrer: referrerHost(body.referrer, req.headers.get("host")),
          country,
          city,
          device,
          browser,
          os,
          userId: (session?.user as { id?: string } | undefined)?.id ?? null
        }
      });
    }

    await prisma.activeVisitor.upsert({
      where: { visitorId },
      update: { path, country: country ?? undefined, device, lastSeen: new Date() },
      create: { visitorId, path, country, device }
    });
    // Occasionally drop presence rows nobody has refreshed in a day.
    if (Math.random() < 0.01) {
      await prisma.activeVisitor.deleteMany({ where: { lastSeen: { lt: new Date(Date.now() - 86400_000) } } });
    }
  } catch {
    // swallow — see above
  }
  return new NextResponse(null, { status: 204 });
}
