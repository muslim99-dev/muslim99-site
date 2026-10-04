import {
  SITE_DESCRIPTION,
  SITE_FAQ,
  SITE_FEATURES,
  SITE_FOUNDER,
  SITE_HIGHLIGHTS,
  SITE_NAME,
  SITE_OVERVIEW,
  SITE_SECTIONS,
  SITE_SOCIAL,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl
} from "@/lib/site";

export const dynamic = "force-static";

/** /llms.txt — a plain summary of the site for AI assistants and AI search
 * (see llmstxt.org), generated from the same source as the site metadata. */
export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
    "",
    `Founded by ${SITE_FOUNDER.name} (${SITE_FOUNDER.linkedin})`,
    "",
    ...SITE_OVERVIEW.flatMap((p) => [p, ""]),
    "## Highlights",
    "",
    ...SITE_HIGHLIGHTS.map((h) => `- ${h.value} ${h.label} — ${h.detail}`),
    "",
    "## Features",
    "",
    ...SITE_FEATURES.map((f) => `- ${f}`),
    "",
    "## Official platforms",
    "",
    `- Website: ${SITE_URL}`,
    ...SITE_SOCIAL.map((s) => `- ${s.name}: ${s.url}`),
    "",
    "## Sections",
    "",
    ...SITE_SECTIONS.map((s) => `- [${s.name}](${absoluteUrl(s.path)}): ${s.description}`),
    "",
    "## About",
    "",
    ...SITE_FAQ.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## More",
    "",
    `- [About ${SITE_NAME}](${absoluteUrl("/about")})`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    ""
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
