"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HEARTBEAT_MS = 15_000;

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Anonymous ids: visitor (persists in this browser), session (this tab). */
function ids() {
  let visitorId = "";
  let sessionId = "";
  try {
    visitorId = localStorage.getItem("m99-vid") || "";
    if (!visitorId) localStorage.setItem("m99-vid", (visitorId = randomId()));
    sessionId = sessionStorage.getItem("m99-sid") || "";
    if (!sessionId) sessionStorage.setItem("m99-sid", (sessionId = randomId()));
  } catch {
    visitorId ||= randomId();
    sessionId ||= randomId();
  }
  return { visitorId, sessionId };
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon?.("/api/analytics/collect", new Blob([body], { type: "application/json" }))) return;
  fetch("/api/analytics/collect", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

const disabled = () =>
  typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || (window as { doNotTrack?: string }).doNotTrack === "1");

/**
 * Records a page view on every route change, then reports how long that
 * page was actually visible (engaged time) with each heartbeat and when the
 * visitor leaves. Heartbeats also drive "online now". Honors Do Not Track.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  const view = useRef<{ id: string; path: string; engaged: number; visibleSince: number | null } | null>(null);

  const engagedMs = () => {
    const v = view.current;
    if (!v) return 0;
    return v.engaged + (v.visibleSince ? Date.now() - v.visibleSince : 0);
  };

  const report = (type: "ping" | "end") => {
    const v = view.current;
    if (!v) return;
    send({ type, path: v.path, viewId: v.id, engagedMs: Math.round(engagedMs()), ...ids() });
  };

  // New page view on every route change; close out the previous one.
  useEffect(() => {
    if (!pathname || disabled()) return;
    if (view.current) report("end");
    if (pathname.startsWith("/admin")) {
      view.current = null;
      return;
    }
    const id = randomId();
    view.current = { id, path: pathname, engaged: 0, visibleSince: document.visibilityState === "visible" ? Date.now() : null };
    send({ type: "view", viewId: id, path: pathname, referrer: first.current ? document.referrer : undefined, ...ids() });
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Engaged-time clock, heartbeat and leave reporting.
  useEffect(() => {
    if (disabled()) return;
    const onVisibility = () => {
      const v = view.current;
      if (!v) return;
      if (document.visibilityState === "visible") {
        v.visibleSince = Date.now();
        report("ping");
      } else {
        if (v.visibleSince) v.engaged += Date.now() - v.visibleSince;
        v.visibleSince = null;
        report("end");
      }
    };
    const timer = setInterval(() => document.visibilityState === "visible" && report("ping"), HEARTBEAT_MS);
    const onLeave = () => report("end");
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onLeave);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
