import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ONLINE_WINDOW_MS } from "@/lib/analytics";

export type Range = "24h" | "7d" | "30d";

const RANGES: Record<Range, { ms: number; unit: "hour" | "day" }> = {
  "24h": { ms: 24 * 3600_000, unit: "hour" },
  "7d": { ms: 7 * 86400_000, unit: "day" },
  "30d": { ms: 30 * 86400_000, unit: "day" }
};

export function isRange(v: unknown): v is Range {
  return v === "24h" || v === "7d" || v === "30d";
}

export function safeTimeZone(tz: unknown) {
  if (typeof tz !== "string" || !/^[A-Za-z0-9_\/+-]{1,48}$/.test(tz)) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

const n = (v: unknown) => Number(v ?? 0);

type Ranked = { label: string; views: number; visitors: number };

// Whitelisted columns only — interpolated as identifiers.
const GROUPABLE = ["path", "section", "referrer", "country", "device", "browser", "os"] as const;

async function topBy(column: (typeof GROUPABLE)[number], since: Date, limit: number): Promise<Ranked[]> {
  const col = Prisma.raw(`"${column}"`);
  const rows = await prisma.$queryRaw<{ label: string; views: bigint; visitors: bigint }[]>`
    SELECT ${col} AS label, count(*) AS views, count(DISTINCT "visitorId") AS visitors
    FROM "PageView"
    WHERE "createdAt" >= ${since} AND ${col} IS NOT NULL
    GROUP BY ${col}
    ORDER BY views DESC
    LIMIT ${limit}`;
  return rows.map((r) => ({ label: r.label, views: n(r.views), visitors: n(r.visitors) }));
}

async function totals(from: Date, to: Date) {
  const [r] = await prisma.$queryRaw<{ views: bigint; visitors: bigint; sessions: bigint }[]>`
    SELECT count(*) AS views, count(DISTINCT "visitorId") AS visitors, count(DISTINCT "sessionId") AS sessions
    FROM "PageView" WHERE "createdAt" >= ${from} AND "createdAt" < ${to}`;
  return { views: n(r?.views), visitors: n(r?.visitors), sessions: n(r?.sessions) };
}

export async function getAnalytics(range: Range, timeZone: string) {
  const cfg = RANGES[range];
  const now = new Date();
  const since = new Date(now.getTime() - cfg.ms);
  const prevSince = new Date(since.getTime() - cfg.ms);
  const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MS);
  const unit = cfg.unit;
  const step = Prisma.raw(`interval '1 ${unit}'`);
  // The window as an interval, so the chart's first bucket is the one the
  // rolling window starts in — bucket sums then always equal the totals.
  const windowInterval = Prisma.raw(`interval '${cfg.ms / 3600_000} hours'`);

  const [current, previous, trendRows, minuteRows, online, recent, pages, sections, referrers, countries, devices, browsers, systems] =
    await Promise.all([
      totals(since, now),
      totals(prevSince, since),
      // Buckets in the viewer's time zone, gaps filled with zero.
      prisma.$queryRaw<{ bucket: Date; views: bigint; visitors: bigint }[]>`
        WITH local AS (
          SELECT date_trunc(${unit}, ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timeZone}) AS b, "visitorId"
          FROM "PageView" WHERE "createdAt" >= ${since}
        ),
        series AS (
          SELECT generate_series(
            date_trunc(${unit}, ((now() - ${windowInterval}) AT TIME ZONE ${timeZone})),
            date_trunc(${unit}, (now() AT TIME ZONE ${timeZone})),
            ${step}
          ) AS b
        )
        SELECT s.b AS bucket, count(l."visitorId") AS views, count(DISTINCT l."visitorId") AS visitors
        FROM series s LEFT JOIN local l ON l.b = s.b
        GROUP BY s.b ORDER BY s.b`,
      prisma.$queryRaw<{ minute: Date; views: bigint }[]>`
        WITH series AS (
          SELECT generate_series(date_trunc('minute', now() AT TIME ZONE 'UTC') - interval '29 minutes',
                                 date_trunc('minute', now() AT TIME ZONE 'UTC'), interval '1 minute') AS m
        )
        SELECT s.m AS minute, count(p.id) AS views
        FROM series s LEFT JOIN "PageView" p
          ON p."createdAt" >= (now() AT TIME ZONE 'UTC') - interval '31 minutes'
         AND date_trunc('minute', p."createdAt") = s.m
        GROUP BY s.m ORDER BY s.m`,
      prisma.activeVisitor.findMany({ where: { lastSeen: { gte: onlineSince } }, select: { path: true, country: true, device: true } }),
      prisma.pageView.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, path: true, country: true, city: true, device: true, browser: true, referrer: true, createdAt: true }
      }),
      topBy("path", since, 10),
      topBy("section", since, 10),
      topBy("referrer", since, 8),
      topBy("country", since, 10),
      topBy("device", since, 3),
      topBy("browser", since, 6),
      topBy("os", since, 6)
    ]);

  const count = <K extends string>(items: Record<K, string | null>[], key: K) => {
    const m = new Map<string, number>();
    for (const it of items) {
      const k = it[key] ?? "Unknown";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m, ([label, visitors]) => ({ label, visitors })).sort((a, b) => b.visitors - a.visitors);
  };

  return {
    range,
    timeZone,
    generatedAt: now.toISOString(),
    online: {
      count: online.length,
      pages: count(online, "path").slice(0, 8),
      countries: count(online, "country").slice(0, 6),
      devices: count(online, "device")
    },
    lastMinutes: minuteRows.map((r) => ({ minute: new Date(r.minute).toISOString(), views: n(r.views) })),
    current,
    previous,
    trend: trendRows.map((r) => ({
      // bucket is a local wall-clock time without zone; send it as such
      bucket: new Date(r.bucket).toISOString().slice(0, 16),
      views: n(r.views),
      visitors: n(r.visitors)
    })),
    unit,
    pages,
    sections,
    referrers,
    countries,
    devices,
    browsers,
    systems,
    recent: recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
