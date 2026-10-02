import { SITE_DESCRIPTION, SITE_FAQ, SITE_NAME, SITE_SECTIONS, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** /llms.txt — a plain summary of the site for AI assistants and AI search
 * (see llmstxt.org), generated from the same source as the site metadata. */
export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}`,
    "",
    `Website: ${SITE_URL}`,
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
