"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { AnalyticsData, Range } from "@/lib/analyticsStats";

const WorldMap = dynamic(() => import("@/components/admin/WorldMap"), { ssr: false });

const REFRESH_MS = 5_000;
const RANGES: { key: Range; label: string }[] = [
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" }
];

// ---------------------------------------------------------------- helpers

const fmt = (v: number) => v.toLocaleString();
function formatMs(ms: number) {
  if (!ms) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}
const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
function countryName(code: string) {
  if (!code || code === "Unknown" || code.length !== 2) return "Unknown";
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
function flag(code: string) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(...code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  quran: "Qur'an",
  hadith: "Hadith",
  tafsir: "Tafsir",
  duas: "Duas",
  "prayer-times": "Prayer Times",
  qibla: "Qibla",
  calendar: "Calendar",
  ask: "Ask AI",
  reciters: "Reciters",
  bookmarks: "Bookmarks",
  auth: "Sign in / up"
};
const sectionLabel = (s: string) => SECTION_LABELS[s] ?? s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function timeAgo(iso: string, now: number) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

/** Bucket strings are local wall-clock "YYYY-MM-DDTHH:mm" in the viewer's zone. */
function bucketLabel(bucket: string, unit: "hour" | "day", long = false) {
  const [d, t] = bucket.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const date = new Date(Date.UTC(y, mo - 1, da, Number(t?.slice(0, 2) ?? 0)));
  if (unit === "hour") {
    const hour = date.toLocaleTimeString("en", { hour: "numeric", timeZone: "UTC" });
    return long ? `${date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}, ${hour}` : hour;
  }
  return date.toLocaleDateString("en", { month: "short", day: "numeric", weekday: long ? "short" : undefined, timeZone: "UTC" });
}

/** Round axis steps (1, 2, 5 × 10ⁿ) with about four intervals. */
function niceScale(v: number) {
  const raw = Math.max(1, v) / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const step = Math.max(1, (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow);
  const max = Math.max(step, Math.ceil(Math.max(1, v) / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= max; t += step) ticks.push(t);
  return { max, ticks };
}
const niceMax = (v: number) => niceScale(v).max;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Change vs the previous period; `lowerIsBetter` flips which way is good. */
function Delta({ now, prev, lowerIsBetter = false }: { now: number; prev: number; lowerIsBetter?: boolean }) {
  if (!prev) return <span className="text-xs text-[var(--viz-muted)]">no previous data</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <span className={`text-xs font-medium ${good ? "text-[var(--viz-up)]" : "text-[var(--viz-down)]"}`}>
      <span aria-hidden>{up ? "▲" : "▼"}</span> {Math.abs(pct)}% <span className="font-normal text-[var(--viz-muted)]">vs previous</span>
    </span>
  );
}

function Card({ title, subtitle, children, right }: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-card border border-[var(--viz-border)] bg-[var(--viz-surface)] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--viz-ink)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--viz-muted)]">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------- charts

/** Per-minute views over the last 30 minutes (single series bars). */
function MinuteBars({ data }: { data: AnalyticsData["lastMinutes"] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 120;
  const max = niceMax(Math.max(1, ...data.map((d) => d.views)));
  const gap = 2;
  const barW = Math.max(2, (width - gap * (data.length - 1)) / data.length);
  const h = (v: number) => (v / max) * (height - 4);

  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height + 20} role="img" aria-label="Page views per minute, last 30 minutes">
        <line x1={0} x2={width} y1={height} y2={height} stroke="var(--viz-axis)" />
        {data.map((d, i) => {
          const x = i * (barW + gap);
          const bh = h(d.views);
          return (
            <g key={d.minute} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={x} y={0} width={barW + gap} height={height} fill="transparent" />
              {d.views > 0 && (
                // Rounded data-end on top, square on the baseline.
                <path
                  d={(() => {
                    const r = Math.min(4, bh, barW / 2);
                    return `M${x},${height} V${height - bh + r} Q${x},${height - bh} ${x + r},${height - bh} H${x + barW - r} Q${x + barW},${height - bh} ${x + barW},${height - bh + r} V${height} Z`;
                  })()}
                  fill="var(--viz-1)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
            </g>
          );
        })}
        <text x={0} y={height + 15} fontSize={11} fill="var(--viz-muted)">
          30 min ago
        </text>
        <text x={width} y={height + 15} fontSize={11} fill="var(--viz-muted)" textAnchor="end">
          now
        </text>
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--viz-border)] bg-[var(--viz-surface)] px-2.5 py-1.5 text-xs shadow-card"
          style={{ left: Math.min(Math.max(hover * (barW + gap) + barW / 2, 50), width - 50) }}
        >
          <strong className="text-[var(--viz-ink)]">{data[hover].views} {data[hover].views === 1 ? "view" : "views"}</strong>
          <span className="block text-[var(--viz-muted)]">
            {new Date(data[hover].minute).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      )}
    </div>
  );
}

/** New accounts per day over the last 30 days (single series bars). */
function SignupBars({ data }: { data: AnalyticsData["users"]["perDay"] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 120;
  const max = niceMax(Math.max(1, ...data.map((d) => d.users)));
  const gap = 2;
  const barW = Math.max(2, (width - gap * (data.length - 1)) / data.length);
  const h = (v: number) => (v / max) * (height - 4);
  const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "short" });

  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height + 20} role="img" aria-label="New registered users per day, last 30 days">
        <line x1={0} x2={width} y1={height} y2={height} stroke="var(--viz-axis)" />
        {data.map((d, i) => {
          const x = i * (barW + gap);
          const bh = h(d.users);
          return (
            <g key={d.day} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={x} y={0} width={barW + gap} height={height} fill="transparent" />
              {d.users > 0 && (
                <path
                  d={(() => {
                    const r = Math.min(4, bh, barW / 2);
                    return `M${x},${height} V${height - bh + r} Q${x},${height - bh} ${x + r},${height - bh} H${x + barW - r} Q${x + barW},${height - bh} ${x + barW},${height - bh + r} V${height} Z`;
                  })()}
                  fill="var(--viz-1)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
            </g>
          );
        })}
        <text x={0} y={height + 15} fontSize={11} fill="var(--viz-muted)">
          {data.length ? dayLabel(data[0].day) : ""}
        </text>
        <text x={width} y={height + 15} fontSize={11} fill="var(--viz-muted)" textAnchor="end">
          today
        </text>
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--viz-border)] bg-[var(--viz-surface)] px-2.5 py-1.5 text-xs shadow-card"
          style={{ left: Math.min(Math.max(hover * (barW + gap) + barW / 2, 50), width - 50) }}
        >
          <strong className="text-[var(--viz-ink)]">
            {data[hover].users} new {data[hover].users === 1 ? "user" : "users"}
          </strong>
          <span className="block text-[var(--viz-muted)]">{dayLabel(data[hover].day)}</span>
        </div>
      )}
    </div>
  );
}

/** Views and unique visitors over time — one axis, two series. */
function TrendChart({ data, unit }: { data: AnalyticsData["trend"]; unit: "hour" | "day" }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 240;
  const pad = { top: 12, right: 72, bottom: 26, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const { max, ticks } = niceScale(Math.max(1, ...data.map((d) => d.views)));
  const x = (i: number) => pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const line = (key: "views" | "visitors") => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70)));
  const last = data[data.length - 1];

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(data.length - 1, Math.max(0, Math.round(rel * (data.length - 1)))));
  }

  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height} role="img" aria-label="Page views and unique visitors over time">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--viz-axis)" : "var(--viz-grid)"} />
            <text x={pad.left - 8} y={y(t) + 4} fontSize={11} textAnchor="end" fill="var(--viz-muted)" style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.bucket} x={x(i)} y={height - 6} fontSize={11} textAnchor="middle" fill="var(--viz-muted)">
              {bucketLabel(d.bucket, unit)}
            </text>
          ) : null
        )}
        <path d={line("views")} fill="none" stroke="var(--viz-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={line("visitors")} fill="none" stroke="var(--viz-2)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* Direct labels at the line ends */}
        {last && (
          <>
            <text x={x(data.length - 1) + 8} y={y(last.views) + 4} fontSize={11} fill="var(--viz-ink-2)">
              Views
            </text>
            <text
              x={x(data.length - 1) + 8}
              y={y(last.visitors) + (Math.abs(y(last.visitors) - y(last.views)) < 14 ? 16 : 4)}
              fontSize={11}
              fill="var(--viz-ink-2)"
            >
              Visitors
            </text>
          </>
        )}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="var(--viz-axis)" />
            <circle cx={x(hover)} cy={y(data[hover].views)} r={4} fill="var(--viz-1)" stroke="var(--viz-surface)" strokeWidth={2} />
            <circle cx={x(hover)} cy={y(data[hover].visitors)} r={4} fill="var(--viz-2)" stroke="var(--viz-surface)" strokeWidth={2} />
          </g>
        )}
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-[var(--viz-border)] bg-[var(--viz-surface)] px-3 py-2 text-xs shadow-card"
          style={{ left: Math.min(Math.max(x(hover), 80), width - 80) }}
        >
          <p className="mb-1 text-[var(--viz-muted)]">{bucketLabel(data[hover].bucket, unit, true)}</p>
          <p className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded bg-[var(--viz-1)]" />
            <strong className="text-[var(--viz-ink)]">{fmt(data[hover].views)}</strong>
            <span className="text-[var(--viz-ink-2)]">views</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded bg-[var(--viz-2)]" />
            <strong className="text-[var(--viz-ink)]">{fmt(data[hover].visitors)}</strong>
            <span className="text-[var(--viz-ink-2)]">visitors</span>
          </p>
        </div>
      )}
    </div>
  );
}

/** Ranked horizontal bars with the value and share always visible. */
function Ranked({
  rows,
  total,
  label = (s: string) => s,
  empty = "No data yet",
  showTime = false
}: {
  rows: { label: string; views: number; avgMs?: number }[];
  total: number;
  label?: (s: string) => React.ReactNode;
  empty?: string;
  showTime?: boolean;
}) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-[var(--viz-muted)]">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.views));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-[var(--viz-ink)]" title={r.label}>
              {label(r.label)}
            </span>
            <span className="shrink-0 text-[var(--viz-ink-2)]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt(r.views)} <span className="text-[var(--viz-muted)]">· {total ? Math.round((r.views / total) * 100) : 0}%</span>
              {showTime && <span className="ml-2 inline-block min-w-[3.5rem] text-right text-[var(--viz-muted)]">⏱ {formatMs(r.avgMs ?? 0)}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--viz-track)]">
            <div className="h-full rounded-full bg-[var(--viz-1)]" style={{ width: `${Math.max(2, (r.views / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- dashboard

function Tile({ label, value, children }: { label: React.ReactNode; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-card border border-[var(--viz-border)] bg-[var(--viz-surface)] p-5">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--viz-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--viz-ink)]">{value}</p>
      <div className="mt-1 min-h-[1rem] text-xs">{children}</div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--viz-live)] opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--viz-live)]" />
    </span>
  );
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<Range>("24h");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showTable, setShowTable] = useState(false);
  const [mapMode, setMapMode] = useState<"live" | "period">("period");
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`/api/analytics/stats?range=${range}&tz=${encodeURIComponent(tz)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't load analytics.");
      setData(json);
      setError(null);
      setUpdatedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load analytics.");
    } finally {
      inFlight.current = false;
    }
  }, [range]);

  // Initial load + live refresh while the tab is visible (old data stays on screen while refetching).
  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    document.addEventListener("visibilitychange", load);
    return () => {
      clearInterval(timer);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", load);
    };
  }, [load]);

  const rangeLabel = RANGES.find((r) => r.key === range)!.label.toLowerCase();
  const total = data?.current.views ?? 0;
  const c = data?.current;
  const p = data?.previous;

  return (
    <div className="viz-root">
      {/* Filters: one row, above every chart */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-[var(--viz-border)] bg-[var(--viz-surface)] p-1" role="tablist" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                range === r.key ? "bg-teal-dark text-white" : "text-[var(--viz-ink-2)] hover:text-[var(--viz-ink)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 text-xs text-[var(--viz-muted)]">
          <LiveDot />
          Live · {updatedAt ? `updated ${timeAgo(new Date(updatedAt).toISOString(), now)}` : "loading…"} · every 5s
          {data && ` · ${data.timeZone}`}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-[var(--viz-border)] bg-[var(--viz-surface)] px-4 py-3 text-sm text-[var(--viz-down)]">
          {error}
        </p>
      )}

      {!data || !c || !p ? (
        !error && <p className="mt-10 text-center text-sm text-[var(--viz-muted)]">Loading analytics…</p>
      ) : (
        <>
          {/* ---------- Live now ---------- */}
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-4">
              <div className="rounded-card border border-[var(--viz-border)] bg-[var(--viz-surface)] p-5">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--viz-muted)]">
                  <LiveDot /> Online now
                </p>
                <p className="mt-2 text-5xl font-semibold text-[var(--viz-ink)]">{fmt(data.online.count)}</p>
                <p className="mt-1 text-xs text-[var(--viz-muted)]">visitors active in the last minute</p>
                {data.online.devices.length > 0 && (
                  <p className="mt-3 text-xs capitalize text-[var(--viz-ink-2)]">
                    {data.online.devices.map((d) => `${d.visitors} ${d.label}`).join(" · ")}
                  </p>
                )}
              </div>
              <Card title="Last 30 minutes" subtitle={`${fmt(data.lastMinutes.reduce((s, m) => s + m.views, 0))} page views · per minute`}>
                <MinuteBars data={data.lastMinutes} />
              </Card>
            </div>
            <Card title="Visitors online right now" subtitle="Where they are, what they are reading, how long they have stayed">
              {data.online.visitors.length ? (
                <div className="max-h-[22rem] overflow-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="sticky top-0 bg-[var(--viz-surface)] text-left text-xs text-[var(--viz-muted)]">
                      <tr>
                        <th className="pb-2 font-medium">Location</th>
                        <th className="pb-2 font-medium">Reading now</th>
                        <th className="pb-2 font-medium">Device</th>
                        <th className="pb-2 text-right font-medium">On site</th>
                        <th className="pb-2 text-right font-medium">Pages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.online.visitors.map((v) => (
                        <tr key={v.id} className="border-t border-[var(--viz-border)]">
                          <td className="whitespace-nowrap py-2 pr-3 text-[var(--viz-ink)]">
                            {v.country ? `${flag(v.country)} ${countryName(v.country)}` : "🌐 Unknown"}
                          </td>
                          <td className="max-w-[220px] truncate py-2 pr-3 text-[var(--viz-ink)]" title={v.path}>
                            {v.path}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 capitalize text-[var(--viz-ink-2)]">{v.device}</td>
                          <td className="whitespace-nowrap py-2 pr-3 text-right text-[var(--viz-ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatMs(v.onSiteMs)}
                          </td>
                          <td className="py-2 text-right text-[var(--viz-ink-2)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {v.pages}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-[var(--viz-muted)]">Nobody online at the moment</p>
              )}
            </Card>
          </div>

          {/* ---------- Headline numbers for the range ---------- */}
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--viz-muted)]">Overview · {rangeLabel}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Tile label="Page views" value={fmt(c.views)}>
              <Delta now={c.views} prev={p.views} />
            </Tile>
            <Tile label="Unique visitors" value={fmt(c.visitors)}>
              <Delta now={c.visitors} prev={p.visitors} />
            </Tile>
            <Tile label="Sessions" value={fmt(c.sessions)}>
              <Delta now={c.sessions} prev={p.sessions} />
            </Tile>
            <Tile label="Avg. session" value={formatMs(c.avgSessionMs)}>
              <Delta now={c.avgSessionMs} prev={p.avgSessionMs} />
            </Tile>
            <Tile label="Avg. time on page" value={formatMs(c.avgViewMs)}>
              <Delta now={c.avgViewMs} prev={p.avgViewMs} />
            </Tile>
            <Tile label="Bounce rate" value={`${Math.round(c.bounceRate * 100)}%`}>
              {p.sessions ? (
                <Delta now={c.bounceRate} prev={p.bounceRate} lowerIsBetter />
              ) : (
                <span className="text-[var(--viz-muted)]">one-page sessions</span>
              )}
            </Tile>
          </div>

          {/* ---------- Locations ---------- */}
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card
              title="Visitor locations"
              subtitle={
                mapMode === "live"
                  ? (() => {
                      const k = data.online.countries.filter((x) => x.label !== "Unknown").length;
                      return `${data.online.count} online now in ${k} ${k === 1 ? "country" : "countries"}`;
                    })()
                  : `${data.countries.length} countries, ${rangeLabel}`
              }
              right={
                <div className="inline-flex rounded-full border border-[var(--viz-border)] p-0.5 text-xs" role="tablist" aria-label="Map mode">
                  {(["period", "live"] as const).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mapMode === m}
                      onClick={() => setMapMode(m)}
                      className={`rounded-full px-3 py-1 font-medium transition-colors ${mapMode === m ? "bg-teal-dark text-white" : "text-[var(--viz-ink-2)]"}`}
                    >
                      {m === "live" ? "● Live" : "Period"}
                    </button>
                  ))}
                </div>
              }
            >
              <WorldMap countries={data.countries} live={data.online.countries} mode={mapMode} />
            </Card>
            <div className="flex flex-col gap-4">
              <Card title="Top countries" subtitle="Views · share · avg. time on page">
                <Ranked rows={data.countries.slice(0, 8)} total={total} label={(x) => `${flag(x)} ${countryName(x)}`} showTime />
              </Card>
              <Card title="Top cities">
                {data.cities.length ? (
                  <ul className="space-y-2 text-sm">
                    {data.cities.map((ct) => (
                      <li key={ct.label} className="flex items-center justify-between gap-3">
                        <span className="truncate text-[var(--viz-ink)]">
                          {ct.country ? `${flag(ct.country)} ` : ""}
                          {ct.label}
                        </span>
                        <span className="shrink-0 text-[var(--viz-ink-2)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {fmt(ct.views)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-[var(--viz-muted)]">City data appears once the site is live on Vercel</p>
                )}
              </Card>
            </div>
          </div>

          {/* ---------- Trend ---------- */}
          <div className="mt-4">
            <Card
              title="Traffic"
              subtitle={`Page views and unique visitors per ${data.unit}, ${rangeLabel}`}
              right={
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="rounded-full border border-[var(--viz-border)] px-3 py-1 text-xs font-medium text-[var(--viz-ink-2)] hover:text-[var(--viz-ink)]"
                >
                  {showTable ? "Show chart" : "Show table"}
                </button>
              }
            >
              {!showTable && (
                <div className="mb-3 flex gap-4 text-xs text-[var(--viz-ink-2)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-[var(--viz-1)]" /> Page views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-[var(--viz-2)]" /> Unique visitors
                  </span>
                </div>
              )}
              {showTable ? (
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--viz-surface)] text-left text-xs text-[var(--viz-muted)]">
                      <tr>
                        <th className="py-2 font-medium">{data.unit === "hour" ? "Hour" : "Day"}</th>
                        <th className="py-2 text-right font-medium">Page views</th>
                        <th className="py-2 text-right font-medium">Unique visitors</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                      {[...data.trend].reverse().map((r) => (
                        <tr key={r.bucket} className="border-t border-[var(--viz-border)]">
                          <td className="py-1.5 text-[var(--viz-ink)]">{bucketLabel(r.bucket, data.unit, true)}</td>
                          <td className="py-1.5 text-right text-[var(--viz-ink)]">{fmt(r.views)}</td>
                          <td className="py-1.5 text-right text-[var(--viz-ink)]">{fmt(r.visitors)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <TrendChart data={data.trend} unit={data.unit} />
              )}
            </Card>
          </div>

          {/* ---------- Engagement ---------- */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card title="Time on page" subtitle="How long each page view was actually on screen">
              <Ranked
                rows={data.durations.map((d) => ({ label: d.label, views: d.views }))}
                total={data.durations.reduce((s, d) => s + d.views, 0)}
              />
            </Card>
            <div className="lg:col-span-2">
              <Card title="Top pages" subtitle={`Views · share · avg. time on page, ${rangeLabel}`}>
                <Ranked rows={data.pages} total={total} showTime />
              </Card>
            </div>
          </div>

          {/* ---------- Audience ---------- */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card title="Sections" subtitle="Which parts of the site are read">
              <Ranked rows={data.sections} total={total} label={sectionLabel} showTime />
            </Card>
            <Card title="Referrers" subtitle="Where visitors came from">
              <Ranked rows={data.referrers} total={data.referrers.reduce((s, r) => s + r.views, 0)} empty="No external referrers yet" />
            </Card>
            <Card title="Devices">
              <Ranked rows={data.devices} total={total} label={(d) => d[0].toUpperCase() + d.slice(1)} showTime />
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--viz-border)] pt-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--viz-muted)]">Browsers</p>
                  <Ranked rows={data.browsers} total={total} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--viz-muted)]">Operating systems</p>
                  <Ranked rows={data.systems} total={total} />
                </div>
              </div>
            </Card>
          </div>

          {/* ---------- Registered users ---------- */}
          <div className="mt-4">
            <Card title="Registered users" subtitle="Accounts created on Muslim99 · new sign-ups verify their email with a code">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Total users", value: fmt(data.users.total), note: <span className="text-[var(--viz-muted)]">all time</span> },
                  { label: `New, ${rangeLabel}`, value: fmt(data.users.newInRange), note: <Delta now={data.users.newInRange} prev={data.users.newPrevious} /> },
                  {
                    label: "Email verified",
                    value: fmt(data.users.verified),
                    note: (
                      <span className="text-[var(--viz-muted)]">
                        {data.users.total ? Math.round((data.users.verified / data.users.total) * 100) : 0}% of accounts
                      </span>
                    )
                  },
                  { label: "Awaiting code", value: fmt(data.users.pending), note: <span className="text-[var(--viz-muted)]">sign-ups not yet verified</span> }
                ].map((t) => (
                  <div key={t.label} className="rounded-2xl border border-[var(--viz-border)] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--viz-muted)]">{t.label}</p>
                    <p className="mt-1.5 text-2xl font-semibold text-[var(--viz-ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {t.value}
                    </p>
                    <div className="mt-0.5 text-xs">{t.note}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--viz-ink-2)]">
                    New users per day · last 30 days · {fmt(data.users.perDay.reduce((n, d) => n + d.users, 0))} total
                  </p>
                  <SignupBars data={data.users.perDay} />
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-medium text-[var(--viz-ink-2)]">Latest sign-ups</p>
                  {data.users.recent.length ? (
                    <div className="max-h-[260px] overflow-auto">
                      <table className="w-full min-w-[420px] text-sm">
                        <thead className="sticky top-0 bg-[var(--viz-surface)] text-left text-xs text-[var(--viz-muted)]">
                          <tr>
                            <th className="pb-2 font-medium">User</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 text-right font-medium">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.users.recent.map((u) => (
                            <tr key={u.id} className="border-t border-[var(--viz-border)]">
                              <td className="max-w-[240px] py-2 pr-3">
                                <span className="block truncate text-[var(--viz-ink)]">{u.name || "—"}</span>
                                <span className="block truncate text-xs text-[var(--viz-muted)]">{u.email}</span>
                              </td>
                              <td className="whitespace-nowrap py-2 pr-3 text-xs">
                                {u.verified ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                                    <span aria-hidden>✓</span> Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                                    <span aria-hidden>–</span> Not verified
                                  </span>
                                )}
                              </td>
                              <td className="whitespace-nowrap py-2 text-right text-xs text-[var(--viz-ink-2)]" title={new Date(u.createdAt).toLocaleString()}>
                                {timeAgo(u.createdAt, now)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-[var(--viz-muted)]">No registered users yet</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* ---------- Live feed ---------- */}
          <div className="mt-4">
            <Card title="Live feed" subtitle="Latest 20 page views, newest first">
              {data.recent.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="text-left text-xs text-[var(--viz-muted)]">
                      <tr>
                        <th className="pb-2 font-medium">When</th>
                        <th className="pb-2 font-medium">Page</th>
                        <th className="pb-2 font-medium">Location</th>
                        <th className="pb-2 font-medium">Device</th>
                        <th className="pb-2 font-medium">From</th>
                        <th className="pb-2 text-right font-medium">Time on page</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((r) => (
                        <tr key={r.id} className="border-t border-[var(--viz-border)]">
                          <td className="whitespace-nowrap py-2 pr-3 text-[var(--viz-muted)]">{timeAgo(r.createdAt, now)}</td>
                          <td className="max-w-[240px] truncate py-2 pr-3 text-[var(--viz-ink)]" title={r.path}>
                            {r.path}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 text-[var(--viz-ink-2)]">
                            {r.country ? `${flag(r.country)} ${[r.city, countryName(r.country)].filter(Boolean).join(", ")}` : "—"}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 text-[var(--viz-ink-2)]">
                            {r.device} · {r.browser}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 text-[var(--viz-ink-2)]">{r.referrer ?? "Direct"}</td>
                          <td className="whitespace-nowrap py-2 text-right text-[var(--viz-ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {r.durationMs ? formatMs(r.durationMs) : <span className="text-[var(--viz-muted)]">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-[var(--viz-muted)]">No page views recorded yet</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
