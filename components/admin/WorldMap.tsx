"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoPath, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import numeric from "@/lib/countryNumeric.json";

type CountryStat = { label: string; views: number; visitors: number; avgMs: number };
type LiveStat = { label: string; visitors: number };
type Shape = Feature<Geometry, { name: string }> & { code: string | null };

// Sequential single-hue ramp (teal), light -> dark; bins chosen per data.
const RAMP = ["#cdeeee", "#94d6d7", "#52b9bb", "#14989b", "#0b6e71"];
const NO_DATA = "var(--viz-track)";

const NUMERIC_TO_ALPHA2 = Object.fromEntries(Object.entries(numeric as Record<string, string>).map(([a2, num]) => [num, a2]));
const BY_NAME: Record<string, string> = { Kosovo: "XK", "N. Cyprus": "CY", Somaliland: "SO" };

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const nameOf = (code: string, fallback: string) => {
  try {
    return regionNames?.of(code) ?? fallback;
  } catch {
    return fallback;
  }
};

function formatMs(ms: number) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Breaks for 5 bins: 1, then quantile-ish steps up to the max. */
function binsFor(values: number[]) {
  const max = Math.max(0, ...values);
  if (max <= 5) return [1, 2, 3, 4, 5].map((v) => Math.min(v, Math.max(1, max)));
  const sorted = [...values].filter((v) => v > 0).sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  const raw = [1, q(0.4), q(0.65), q(0.85), max];
  return raw.map((v, i) => Math.max(v, i ? raw[i - 1] + 1 : 1));
}

export default function WorldMap({ countries, live, mode }: { countries: CountryStat[]; live: LiveStat[]; mode: "period" | "live" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [shapes, setShapes] = useState<Shape[] | null>(null);
  const [hover, setHover] = useState<{ code: string; name: string; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // Load the world outline only when the dashboard is opened.
  useEffect(() => {
    let alive = true;
    import("world-atlas/countries-110m.json").then((mod) => {
      const topo = (mod.default ?? mod) as unknown as Parameters<typeof feature>[0];
      const fc = feature(topo, (topo as unknown as { objects: { countries: Parameters<typeof feature>[1] } }).objects.countries) as unknown as {
        features: Feature<Geometry, { name: string }>[];
      };
      const list = fc.features
        .filter((f) => f.properties.name !== "Antarctica")
        .map((f) => ({ ...f, code: (f.id !== undefined && NUMERIC_TO_ALPHA2[String(f.id)]) || BY_NAME[f.properties.name] || null }));
      if (alive) setShapes(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const height = Math.round(width * 0.48);
  const projection = useMemo(() => {
    const p = geoEqualEarth();
    if (shapes) p.fitExtent([[4, 4], [width - 4, height - 4]], { type: "FeatureCollection", features: shapes } as never);
    return p;
  }, [shapes, width, height]);
  const path = useMemo(() => geoPath(projection), [projection]);

  const stats = useMemo(() => new Map(countries.map((c) => [c.label, c])), [countries]);
  const liveMap = useMemo(() => new Map(live.map((l) => [l.label, l.visitors])), [live]);
  const bins = useMemo(() => binsFor(countries.map((c) => c.visitors)), [countries]);
  const colorFor = (v: number) => {
    if (!v) return NO_DATA;
    const i = bins.findIndex((b) => v <= b);
    return RAMP[i === -1 ? RAMP.length - 1 : i];
  };
  const maxLive = Math.max(1, ...live.map((l) => l.visitors));

  const hovered = hover ? stats.get(hover.code) : undefined;

  return (
    <div ref={ref} className="relative">
      {!shapes ? (
        <div className="grid place-items-center text-sm text-[var(--viz-muted)]" style={{ height }}>
          Loading map…
        </div>
      ) : (
        <svg width={width} height={height} role="img" aria-label={mode === "live" ? "Map of visitors online now" : "Map of visitors by country"}>
          {shapes.map((s, i) => {
            const v = s.code ? stats.get(s.code)?.visitors ?? 0 : 0;
            const fill = mode === "live" ? (s.code && liveMap.has(s.code) ? RAMP[1] : NO_DATA) : colorFor(v);
            return (
              <path
                key={`${s.code ?? s.properties.name}-${i}`}
                d={path(s) ?? undefined}
                fill={fill}
                stroke="var(--viz-surface)"
                strokeWidth={0.6}
                onPointerMove={(e) => {
                  const box = ref.current!.getBoundingClientRect();
                  setHover({ code: s.code ?? "", name: s.code ? nameOf(s.code, s.properties.name) : s.properties.name, x: e.clientX - box.left, y: e.clientY - box.top });
                }}
                onPointerLeave={() => setHover(null)}
                style={{ cursor: "default" }}
              />
            );
          })}
          {mode === "live" &&
            shapes
              .filter((s) => s.code && liveMap.has(s.code))
              .map((s) => {
                const [cx, cy] = projection(geoCentroid(s)) ?? [0, 0];
                const count = liveMap.get(s.code!)!;
                const r = 5 + 9 * Math.sqrt(count / maxLive);
                return (
                  <g key={`live-${s.code}`} pointerEvents="none">
                    <circle cx={cx} cy={cy} r={r} fill="var(--viz-live)" opacity={0.25}>
                      <animate attributeName="r" values={`${r};${r * 2.2};${r}`} dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.35;0;0.35" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={cx} cy={cy} r={r * 0.6} fill="var(--viz-live)" stroke="var(--viz-surface)" strokeWidth={2} />
                  </g>
                );
              })}
        </svg>
      )}

      {hover && (
        <div
          className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--viz-border)] bg-[var(--viz-surface)] px-3 py-2 text-xs shadow-card"
          style={{ left: Math.min(Math.max(hover.x, 80), width - 80), top: hover.y - 10 }}
        >
          <p className="font-medium text-[var(--viz-ink)]">{hover.name}</p>
          {mode === "live" ? (
            <p className="text-[var(--viz-ink-2)]">
              <strong className="text-[var(--viz-ink)]">{liveMap.get(hover.code) ?? 0}</strong> online now
            </p>
          ) : hovered ? (
            <>
              <p className="text-[var(--viz-ink-2)]">
                <strong className="text-[var(--viz-ink)]">{hovered.visitors.toLocaleString()}</strong> visitors ·{" "}
                <strong className="text-[var(--viz-ink)]">{hovered.views.toLocaleString()}</strong> views
              </p>
              <p className="text-[var(--viz-ink-2)]">
                avg. time on page <strong className="text-[var(--viz-ink)]">{formatMs(hovered.avgMs)}</strong>
              </p>
            </>
          ) : (
            <p className="text-[var(--viz-muted)]">No visitors</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--viz-ink-2)]">
        {mode === "live" ? (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[var(--viz-live)]" /> Visitors online now (dot size = number)
          </span>
        ) : (
          <>
            <span className="text-[var(--viz-muted)]">Visitors</span>
            {RAMP.map((c, i) => {
              const lo = i === 0 ? 1 : bins[i - 1] + 1;
              const hi = bins[i];
              if (lo > hi) return null;
              return (
                <span key={c} className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded-sm" style={{ background: c }} />
                  {lo === hi ? lo : `${lo}–${hi}`}
                </span>
              );
            })}
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm" style={{ background: NO_DATA }} /> None
            </span>
          </>
        )}
      </div>
    </div>
  );
}
