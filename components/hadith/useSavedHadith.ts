"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hadithRefId, type HadithLocation, type SavedKind } from "@/lib/hadithRefs";

/** The signed-in user's hadith bookmarks and favourites, as a set of refIds,
 * with optimistic toggling against /api/bookmarks. Signed-out visitors are
 * sent to sign in and brought back to the same hadith afterwards. */
export function useSavedHadith() {
  const { status } = useSession();
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => {
        const refs = (d.bookmarks ?? [])
          .filter((b: { type: string }) => b.type === "HADITH")
          .map((b: { refId: string }) => b.refId);
        setSaved(new Set(refs));
      })
      .catch(() => {});
  }, [status]);

  const isSaved = useCallback((loc: HadithLocation, kind: SavedKind) => saved.has(hadithRefId(loc, kind)), [saved]);

  const toggle = useCallback(
    async (loc: HadithLocation, kind: SavedKind) => {
      if (status !== "authenticated") {
        const back = `${window.location.pathname}?hadith=${loc.hadith}`;
        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(back)}`;
        return;
      }
      const refId = hadithRefId(loc, kind);
      const wasSaved = saved.has(refId);
      const flip = (prev: Set<string>) => {
        const next = new Set(prev);
        wasSaved ? next.delete(refId) : next.add(refId);
        return next;
      };
      setSaved(flip);
      const res = await fetch("/api/bookmarks", {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "HADITH", refId, folder: kind === "favourite" ? "Favourites" : "Bookmarks" })
      }).catch(() => null);
      if (!res?.ok) setSaved(flip); // revert
    },
    [saved, status]
  );

  return { isSaved, toggle, signedIn: status === "authenticated" };
}
