import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Search engines and AI assistants (which power AI overviews/answers) may
// read every public page; account, admin and API routes stay out.
const PRIVATE = ["/admin", "/api/", "/auth/", "/profile", "/settings", "/bookmarks", "/hadith/saved"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Named explicitly so AI search/answer crawlers know they are welcome.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "Google-Extended", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Applebot-Extended", "Bingbot"], allow: "/", disallow: PRIVATE }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
