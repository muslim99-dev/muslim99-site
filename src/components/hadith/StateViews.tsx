"use client";

import { LucideIcon, SearchX, BookX } from "lucide-react";

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

export { BookX };
