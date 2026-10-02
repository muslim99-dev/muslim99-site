/**
 * Identifiers for saved hadiths, shared by client and server.
 *
 * Bookmarks and favourites both live in the existing Bookmark table as
 * type HADITH. Its refId is free-form and unique per user+type, so a
 * favourite gets a "fav:" prefix — that lets one hadith be both bookmarked
 * and favourited without a schema change.
 */

export type HadithLocation = { slug: string; book: number; chapter: number; hadith: number };

export type SavedKind = "bookmark" | "favourite";

const FAV_PREFIX = "fav:";

export function hadithRefId(loc: HadithLocation, kind: SavedKind): string {
  const base = `${loc.slug}/${loc.book}/${loc.chapter}/${loc.hadith}`;
  return kind === "favourite" ? FAV_PREFIX + base : base;
}

export function parseHadithRefId(refId: string): (HadithLocation & { kind: SavedKind }) | null {
  const kind: SavedKind = refId.startsWith(FAV_PREFIX) ? "favourite" : "bookmark";
  const parts = (kind === "favourite" ? refId.slice(FAV_PREFIX.length) : refId).split("/");
  if (parts.length !== 4) return null;
  const [slug, book, chapter, hadith] = [parts[0], Number(parts[1]), Number(parts[2]), Number(parts[3])];
  if (!slug || ![book, chapter, hadith].every(Number.isInteger)) return null;
  return { slug, book, chapter, hadith, kind };
}

export function hadithHref(loc: HadithLocation): string {
  return `/hadith/${loc.slug}/${loc.book}/${loc.chapter}?hadith=${loc.hadith}`;
}

/** Same refId shape without the prefix — used to key lookups. */
export function locationKey(loc: HadithLocation): string {
  return hadithRefId(loc, "bookmark");
}
