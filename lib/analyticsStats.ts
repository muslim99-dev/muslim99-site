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

export type Ranked = { label: string; views: number; visitors: number; avgMs: number };

// Whitelisted columns only — interpolated as identifiers.
const GROUPABLE = ["path", "section", "referrer", "country", "device", "browser", "os"] as const;

async function topBy(column: (typeof GROUPABLE)[number], since: Date, limit: number): Promise<Ranked[]> {
  const col = Prisma.raw(`"${column}"`);
  const rows = await prisma.$queryRaw<{ label: string; views: bigint; visitors: bigint; avg: number | null }[]>`
    SELECT ${col} AS label, count(*) AS views, count(DISTINCT "visitorId") AS visitors,
           avg("durationMs") FILTER (WHERE "durationMs" > 0)::float AS avg
    FROM "PageView"
    WHERE "createdAt" >= ${since} AND ${col} IS NOT NULL
    GROUP BY ${col}
    ORDER BY views DESC
    LIMIT ${limit}`;
  return rows.map((r) => ({ label: r.label, views: n(r.views), visitors: n(r.visitors), avgMs: Math.round(n(r.avg)) }));
}

/** Totals plus engagement for one window. A session's length is the
 * engaged time of all its page views; a bounce is a one-page session. */
async function totals(from: Date, to: Date) {
  const [r] = await prisma.$queryRaw<
    { views: bigint; visitors: bigint; sessions: bigint; avg_view: number | null; avg_session: number | null; bounces: bigint }[]
  >`
    WITH s AS (
      SELECT "sessionId", count(*) AS views, sum(coalesce("durationMs", 0)) AS ms
      FROM "PageView" WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
      GROUP BY "sessionId"
    )
    SELECT
      (SELECT count(*) FROM "PageView" WHERE "createdAt" >= ${from} AND "createdAt" < ${to}) AS views,
      (SELECT count(DISTINCT "visitorId") FROM "PageView" WHERE "createdAt" >= ${from} AND "createdAt" < ${to}) AS visitors,
      (SELECT count(*) FROM s) AS sessions,
      (SELECT avg("durationMs")::float FROM "PageView" WHERE "createdAt" >= ${from} AND "createdAt" < ${to} AND "durationMs" > 0) AS avg_view,
      (SELECT avg(ms)::float FROM s WHERE ms > 0) AS avg_session,
      (SELECT count(*) FROM s WHERE views = 1) AS bounces`;
  const sessions = n(r?.sessions);
  return {
    views: n(r?.views),
    visitors: n(r?.visitors),
    sessions,
    avgViewMs: Math.round(n(r?.avg_view)),
    avgSessionMs: Math.round(n(r?.avg_session)),
    bounceRate: sessions ? n(r?.bounces) / sessions : 0
  };
}

const DURATION_BUCKETS = [
  { label: "Under 10s", max: 10_000 },
  { label: "10–30s", max: 30_000 },
  { label: "30s–1m", max: 60_000 },
  { label: "1–3m", max: 180_000 },
  { label: "3–10m", max: 600_000 },
  { label: "10m+", max: Infinity }
];

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

  const [
    current,
    previous,
    trendRows,
    minuteRows,
    online,
    recent,
    pages,
    sections,
    referrers,
    countries,
    devices,
    browsers,
    systems,
    cityRows,
    durationRows
  ] = await Promise.all([
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
    prisma.activeVisitor.findMany({
      where: { lastSeen: { gte: onlineSince } },
      select: { visitorId: true, path: true, country: true, device: true, lastSeen: true },
      orderBy: { lastSeen: "desc" }
    }),
    prisma.pageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, path: true, country: true, city: true, device: true, browser: true, referrer: true, durationMs: true, createdAt: true }
    }),
    topBy("path", since, 10),
    topBy("section", since, 10),
    topBy("referrer", since, 8),
    topBy("country", since, 250),
    topBy("device", since, 3),
    topBy("browser", since, 6),
    topBy("os", since, 6),
    prisma.$queryRaw<{ city: string; country: string | null; views: bigint; visitors: bigint }[]>`
      SELECT "city" AS city, max("country") AS country, count(*) AS views, count(DISTINCT "visitorId") AS visitors
      FROM "PageView" WHERE "createdAt" >= ${since} AND "city" IS NOT NULL
      GROUP BY "city" ORDER BY views DESC LIMIT 8`,
    prisma.$queryRaw<{ bucket: number; views: bigint }[]>`
      SELECT CASE
               WHEN "durationMs" < 10000 THEN 0 WHEN "durationMs" < 30000 THEN 1 WHEN "durationMs" < 60000 THEN 2
               WHEN "durationMs" < 180000 THEN 3 WHEN "durationMs" < 600000 THEN 4 ELSE 5 END AS bucket,
             count(*) AS views
      FROM "PageView" WHERE "createdAt" >= ${since} AND "durationMs" IS NOT NULL
      GROUP BY 1`
  ]);

  // How long each online visitor has been on the site (their current visit
  // = page views in the last 4 hours).
  const onlineIds = online.map((o) => o.visitorId);
  const firstSeen = onlineIds.length
    ? await prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { visitorId: { in: onlineIds }, createdAt: { gte: new Date(now.getTime() - 4 * 3600_000) } },
        _min: { createdAt: true },
        _count: { _all: true }
      })
    : [];
  const visitStart = new Map(firstSeen.map((f) => [f.visitorId, { start: f._min.createdAt, pages: f._count._all }]));

  const tally = <K extends "path" | "country" | "device">(key: K) => {
    const m = new Map<string, number>();
    for (const it of online) {
      const k = it[key] ?? "Unknown";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m, ([label, visitors]) => ({ label, visitors })).sort((a, b) => b.visitors - a.visitors);
  };

  const durationCounts = new Map(durationRows.map((r) => [n(r.bucket), n(r.views)]));

  return {
    range,
    timeZone,
    generatedAt: now.toISOString(),
    online: {
      count: online.length,
      pages: tally("path").slice(0, 8),
      countries: tally("country"),
      devices: tally("device"),
      visitors: online.slice(0, 25).map((o) => ({
        id: o.visitorId.slice(-6),
        path: o.path,
        country: o.country,
        device: o.device,
        onSiteMs: visitStart.get(o.visitorId)?.start ? now.getTime() - visitStart.get(o.visitorId)!.start!.getTime() : 0,
        pages: visitStart.get(o.visitorId)?.pages ?? 1
      }))
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
    cities: cityRows.map((c) => ({ label: c.city, country: c.country, views: n(c.views), visitors: n(c.visitors) })),
    durations: DURATION_BUCKETS.map((b, i) => ({ label: b.label, views: durationCounts.get(i) ?? 0 })),
    devices,
    browsers,
    systems,
    recent: recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
