/**
 * First-party traffic analytics helpers (server-side).
 *
 * Nothing personal is stored: no IP addresses, no full user agents, no
 * query strings. A visitor is a random id kept in their browser; country
 * and city come from the hosting edge's geo headers (Vercel), when present.
 */

const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|preview|headless|lighthouse|pagespeed|monitor|uptime|curl|wget|python|axios|node-fetch|go-http/i;

export function isBot(ua: string) {
  return !ua || BOT.test(ua);
}

export function parseUserAgent(ua: string) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /chrome|crios/i.test(ua)
            ? "Chrome"
            : /safari/i.test(ua)
              ? "Safari"
              : "Other";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ipod/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac os/i.test(ua)
          ? "macOS"
          : /cros/i.test(ua)
            ? "ChromeOS"
            : /linux/i.test(ua)
              ? "Linux"
              : "Other";
  return { device, browser, os };
}

/** "/hadith/sahih-bukhari/1" -> "hadith"; "/" -> "home". */
export function sectionOf(path: string) {
  return path.split("/")[1] || "home";
}

/** Keeps only an external referrer's host ("google.com"); own-site and
 * missing referrers return null. */
export function referrerHost(referrer: string | undefined, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0]) return null;
    return host.slice(0, 100);
  } catch {
    return null;
  }
}

/** Normalizes a client-reported path: pathname only, bounded length. */
export function cleanPath(path: unknown) {
  if (typeof path !== "string" || !path.startsWith("/")) return null;
  return path.split(/[?#]/)[0].slice(0, 200) || "/";
}

export const ONLINE_WINDOW_MS = 60 * 1000; // heartbeat every 15s; a minute of silence = gone

/** The only account allowed to see analytics. Fixed in code on purpose:
 * no environment variable or database change can grant anyone else access. */
export const ANALYTICS_ADMIN_EMAIL = "hafizabdullahqurashi1@gmail.com";

export function isAdminEmail(email: string | null | undefined) {
  return !!email && email.trim().toLowerCase() === ANALYTICS_ADMIN_EMAIL;
}
