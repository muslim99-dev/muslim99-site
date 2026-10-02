"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HEARTBEAT_MS = 30_000;

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

/** Records a page view on every route change and a heartbeat while the
 * tab is visible (for "online now"). Honors Do Not Track. */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  const disabled = () =>
    typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || (window as { doNotTrack?: string }).doNotTrack === "1");

  useEffect(() => {
    if (!pathname || disabled() || pathname.startsWith("/admin")) return;
    send({
      type: "view",
      path: pathname,
      referrer: first.current ? document.referrer : undefined,
      ...ids()
    });
    first.current = false;
  }, [pathname]);

  useEffect(() => {
    if (disabled()) return;
    const ping = () => {
      if (document.visibilityState !== "visible" || location.pathname.startsWith("/admin")) return;
      send({ type: "ping", path: location.pathname, ...ids() });
    };
    const timer = setInterval(ping, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", ping);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);

  return null;
}
