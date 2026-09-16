"use client";

import { useRouter, usePathname } from "next/navigation";
import type { HadithEditionInfo } from "@/lib/hadith";
import { editionLabel } from "@/lib/hadith";

export default function HadithEditionSwitcher({
  editions,
  current
}: {
  editions: HadithEditionInfo[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={current}
      onChange={(e) => router.push(`${pathname}?edition=${e.target.value}`)}
      className="rounded-full border border-border px-3 py-1.5 bg-white text-xs"
      aria-label="Language"
    >
      {editions.map((e) => (
        <option key={e.name} value={e.name}>
          {editionLabel(e)}
        </option>
      ))}
    </select>
  );
}
