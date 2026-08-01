"use client";

import { LucideIcon, SearchX, WifiOff, BookX } from "lucide-react";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--soft)", color: "var(--primary)" }}
      >
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-[16px] font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(217, 77, 77, 0.12)", color: "#c24a4a" }}
      >
        <WifiOff size={24} />
      </div>
      <h3 className="mt-4 text-[16px] font-semibold" style={{ color: "var(--text)" }}>
        Something didn&rsquo;t load
      </h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        {message ?? "We couldn't reach the hadith data just now. Please check your connection and try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-primary mt-5 px-5 py-2.5 text-[13.5px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}

export { BookX };
