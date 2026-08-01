function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ background: "var(--card-2)", ...style }}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="card-surface flex items-start gap-4 p-5">
      <Shimmer className="h-14 w-14 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <Shimmer className="h-4 w-3/5" />
        <Shimmer className="h-3 w-2/5" />
        <Shimmer className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function ChapterRowSkeleton() {
  return (
    <div className="card-surface flex items-center gap-4 p-4">
      <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
      <Shimmer className="h-4 flex-1" />
      <Shimmer className="h-3 w-10 shrink-0" />
    </div>
  );
}

export function HadithCardSkeleton() {
  return (
    <div className="card-surface space-y-3.5 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <Shimmer className="h-6 w-24 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      <Shimmer className="h-4 w-1/3" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-2/3" />
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="space-y-2 rounded-[var(--r-card)] p-3.5" style={{ background: "var(--card-2)" }}>
      <Shimmer className="h-3 w-1/3" />
      <Shimmer className="h-3.5 w-full" />
      <Shimmer className="h-3.5 w-4/5" />
    </div>
  );
}
