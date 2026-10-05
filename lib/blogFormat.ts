/**
 * Blog helpers shared by the public pages and the admin editor (client and
 * server): Markdown rendering, slugs, reading time and the post input rules.
 * Database access lives in lib/blog.ts (server-only).
 */
import { Marked, type Tokens } from "marked";

export const BLOG_CATEGORIES = ["Quran", "Hadith", "Tafsir", "Duas & Azkar", "Prayer", "Ramadan", "Islamic History", "Seerah", "Muslim99 Updates", "General"];

export const BLOG_PAGE_SIZE = 9;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Minutes to read at ~200 words a minute. */
export function readingTime(markdown: string) {
  const words = markdown.replace(/[#>*_`\[\]()!-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Only http(s), mailto, site-relative and in-page links/images are allowed. */
function safeUrl(href: string) {
  const h = href.trim();
  return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(h) ? h : "";
}

const marked = new Marked({ gfm: true, breaks: true });
marked.use({
  renderer: {
    // Raw HTML in a post is shown as text, never rendered.
    html(token: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(token.text);
    },
    // dir="auto" so Arabic / Urdu paragraphs read right-to-left.
    paragraph(token: Tokens.Paragraph) {
      return `<p dir="auto">${this.parser.parseInline(token.tokens)}</p>\n`;
    },
    heading(token: Tokens.Heading) {
      const text = this.parser.parseInline(token.tokens);
      const id = slugify(token.text) || undefined;
      const level = Math.min(Math.max(token.depth, 2), 4); // the page title is the only h1
      return `<h${level}${id ? ` id="${id}"` : ""}>${text}</h${level}>\n`;
    },
    link(token: Tokens.Link) {
      const href = safeUrl(token.href);
      const text = this.parser.parseInline(token.tokens);
      if (!href) return text;
      const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?themuslim99\.com/i.test(href);
      return `<a href="${escapeHtml(href)}"${token.title ? ` title="${escapeHtml(token.title)}"` : ""}${
        external ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${text}</a>`;
    },
    image(token: Tokens.Image) {
      const src = safeUrl(token.href);
      if (!src) return "";
      const caption = token.title ? `<figcaption>${escapeHtml(token.title)}</figcaption>` : "";
      return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(token.text)}" loading="lazy" />${caption}</figure>`;
    }
  }
});

export function renderMarkdown(md: string) {
  return marked.parse(md || "", { async: false }) as string;
}

/** h2/h3 headings for a table of contents. */
export function headingsOf(md: string) {
  return Array.from((md || "").matchAll(/^(#{2,3})\s+(.+?)\s*#*$/gm)).map((m) => ({
    level: m[1].length,
    text: m[2].replace(/[*_`]/g, ""),
    id: slugify(m[2])
  }));
}

export type BlogInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

/** Validates and normalises an editor payload. Returns an error message or the clean input. */
export function parseBlogInput(body: unknown): { error: string } | { data: BlogInput } {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const title = str(b.title, 160);
  const slug = slugify(str(b.slug, 120) || title);
  const content = typeof b.content === "string" ? b.content.slice(0, 200_000) : "";
  const status = b.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "The slug needs at least one letter or number." };
  if (status === "PUBLISHED" && content.trim().length < 20) return { error: "Write some content before publishing." };
  const cover = str(b.coverImage, 1000);
  if (cover && !safeUrl(cover)) return { error: "The cover image must be an uploaded image or an https:// URL." };
  const plain = content.replace(/[#>*_`\[\]()!]/g, "").replace(/\s+/g, " ").trim();
  return {
    data: {
      title,
      slug,
      excerpt: str(b.excerpt, 400) || plain.slice(0, 220),
      content,
      coverImage: cover || null,
      coverAlt: str(b.coverAlt, 200) || null,
      category: str(b.category, 60) || "General",
      tags: (Array.isArray(b.tags) ? b.tags : typeof b.tags === "string" ? b.tags.split(",") : [])
        .map((t) => String(t).trim().slice(0, 40))
        .filter(Boolean)
        .slice(0, 12),
      status,
      featured: b.featured === true,
      authorName: str(b.authorName, 80) || "Muslim99 Team",
      metaTitle: str(b.metaTitle, 70) || null,
      metaDescription: str(b.metaDescription, 170) || null
    }
  };
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
