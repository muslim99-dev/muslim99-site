"use client";

import { useRef, useState } from "react";
import Pagination, { PAGE_SIZE } from "@/components/tafsir/Pagination";

/** Shows already-rendered items 15 per page (server-rendered cards work too). */
export default function PagedGrid({ items, label, className }: { items: React.ReactNode[]; label: string; className: string }) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, total);

  function go(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className={className}>{items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)}</div>
      <Pagination page={current} total={total} count={items.length} label={label} onChange={go} />
    </div>
  );
}
