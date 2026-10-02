import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanPath, isBot, parseUserAgent, referrerHost, sectionOf } from "@/lib/analytics";

const ID = /^[a-zA-Z0-9-]{8,64}$/;
const MAX_DURATION_MS = 4 * 3600_000; // a tab left open all night isn't a 9-hour read

/**
 * Receives events from AnalyticsTracker:
 *   view — a page was opened (creates the PageView, id chosen by the client)
 *   ping — heartbeat while visible, with engaged time so far
 *   end  — the visitor left the page or hid the tab, with final engaged time
 * Always answers 204 — analytics must never break or slow the site.
 */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (isBot(ua)) return new NextResponse(null, { status: 204 });

    const body = await req.json().catch(() => null);
    const path = cleanPath(body?.path);
    const { visitorId, sessionId, viewId, type } = body ?? {};
    if (
      !path ||
      !ID.test(visitorId ?? "") ||
      !ID.test(sessionId ?? "") ||
      !ID.test(viewId ?? "") ||
      !["view", "ping", "end"].includes(type)
    ) {
      return new NextResponse(null, { status: 204 });
    }
    if (path.startsWith("/admin") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });

    const { device, browser, os } = parseUserAgent(ua);
    const country = req.headers.get("x-vercel-ip-country") || null;
    const cityRaw = req.headers.get("x-vercel-ip-city");
    const city = cityRaw ? decodeURIComponent(cityRaw).slice(0, 80) : null;

    if (type === "view") {
      const session = await getServerSession(authOptions).catch(() => null);
      await prisma.pageView.createMany({
        skipDuplicates: true,
        data: [
          {
            id: viewId,
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
            userId: (session?.user as { id?: string } | undefined)?.id ?? null,
            durationMs: 0
          }
        ]
      });
    } else {
      const ms = Math.min(Math.max(0, Math.round(Number(body.engagedMs) || 0)), MAX_DURATION_MS);
      // Only ever grows; scoped to the visitor that created the view.
      await prisma.pageView.updateMany({
        where: { id: viewId, visitorId, OR: [{ durationMs: null }, { durationMs: { lt: ms } }] },
        data: { durationMs: ms }
      });
    }

    if (type !== "end") {
      await prisma.activeVisitor.upsert({
        where: { visitorId },
        update: { path, country: country ?? undefined, device, lastSeen: new Date() },
        create: { visitorId, path, country, device }
      });
    } else {
      // Left the page: stop counting them as online straight away.
      await prisma.activeVisitor.updateMany({
        where: { visitorId, path },
        data: { lastSeen: new Date(Date.now() - 10 * 60_000) }
      });
    }
    // Occasionally drop presence rows nobody has refreshed in a day.
    if (Math.random() < 0.01) {
      await prisma.activeVisitor.deleteMany({ where: { lastSeen: { lt: new Date(Date.now() - 86400_000) } } });
    }
  } catch {
    // swallow — see above
  }
  return new NextResponse(null, { status: 204 });
}
