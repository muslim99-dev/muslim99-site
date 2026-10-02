import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/** Shared presentational pieces for the Hadith section. */

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  // Same trail as structured data, so search results show "Muslim99 › Hadith › …".
  const trail = [{ label: SITE_NAME, href: "/" }, ...items];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: absoluteUrl(it.href) } : {})
    }))
  };
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <JsonLd data={breadcrumbJsonLd} />
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-border">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-deep transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-teal-dark font-medium line-clamp-1">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Eight-point star lattice used as a faint backdrop on hero headers. */
export function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} width="100%" height="100%">
      <defs>
        <pattern id="hadith-star" width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="16" y="16" width="24" height="24" />
            <rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
            <circle cx="28" cy="28" r="5" />
            <path d="M0 28h10M46 28h10M28 0v10M28 46v10" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hadith-star)" />
    </svg>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  arabic,
  children
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  arabic?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-teal-dark via-[#0E5558] to-primary-deep px-6 py-8 sm:px-10 sm:py-10 text-white shadow-card">
      <IslamicPattern className="absolute inset-0 text-white/[0.07]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>}
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">{subtitle}</p>}
        </div>
        {arabic && (
          <p dir="rtl" className="font-urdu text-xl sm:text-2xl leading-[2.2] text-white/90 md:text-right md:max-w-md">
            {arabic}
          </p>
        )}
      </div>
      {children && <div className="relative mt-6">{children}</div>}
    </header>
  );
}

export function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
      <p className="text-lg sm:text-xl font-semibold tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-white/65">{label}</p>
    </div>
  );
}

const GRADE_STYLES: Record<string, string> = {
  sahih: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  hasan: "bg-sky-50 text-sky-700 ring-sky-200",
  zaeef: "bg-amber-50 text-amber-800 ring-amber-200",
  daif: "bg-amber-50 text-amber-800 ring-amber-200"
};

export function GradeBadge({ status, size = "sm" }: { status?: string; size?: "xs" | "sm" }) {
  if (!status) return null;
  const style = GRADE_STYLES[status.toLowerCase()] ?? "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full ring-1 font-medium ${style} ${
        size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      }`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function LanguageTags({ languages, tone = "light" }: { languages: string[]; tone?: "light" | "dark" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {languages.map((l) => (
        <span
          key={l}
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            tone === "dark" ? "bg-white/15 text-white/85" : "bg-aqua text-primary-deep"
          }`}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

/** Numbered medallion used for book / chapter / hadith numbers. */
export function NumberBadge({ n, className = "" }: { n: number | string; className?: string }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-aqua text-sm font-semibold tabular-nums text-primary-deep ring-1 ring-primary/15 ${className}`}
    >
      {n}
    </span>
  );
}

export function ErrorCard({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-card border border-border bg-white p-10 text-center">
      <p className="font-medium text-teal-dark">{title}</p>
      {detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
    </div>
  );
}
