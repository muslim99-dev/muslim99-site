"use client";

export const PAGE_SIZE = 15;

/** Page numbers with ellipses: 1 2 3 4 5 … 9 · 1 … 4 5 6 … 9 · 1 … 5 6 7 8 9 */
function pageList(page: number, total: number): (number | "…")[] {
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  if (total <= 7) return range(1, total);
  if (page <= 4) return [...range(1, 5), "…", total];
  if (page >= total - 3) return [1, "…", ...range(total - 4, total)];
  return [1, "…", page - 1, page, page + 1, "…", total];
}

export default function Pagination({
  page,
  total,
  count,
  label,
  onChange
}: {
  page: number;
  total: number;
  count: number;
  label: string;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, count);
  const btn = "grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-medium transition-colors";

  return (
    <nav className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between" aria-label={`${label} pages`}>
      <p className="text-xs text-muted">
        Showing {from}–{to} of {count} {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={`${btn} border border-border bg-white text-teal-dark hover:border-primary disabled:pointer-events-none disabled:opacity-40`}
        >
          ←
        </button>
        {pageList(page, total).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${btn} ${p === page ? "bg-teal-dark text-white" : "text-teal-dark hover:bg-aqua"}`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === total}
          aria-label="Next page"
          className={`${btn} border border-border bg-white text-teal-dark hover:border-primary disabled:pointer-events-none disabled:opacity-40`}
        >
          →
        </button>
      </div>
    </nav>
  );
}
