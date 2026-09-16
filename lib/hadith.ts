/**
 * HadithProvider
 * ------------------------------------------------------------------
 * Source: fawazahmed0/hadith-api (MIT-licensed, aggregates classical
 * hadith collections with narrator text, grading, and reference —
 * itself sourced from sunnah.com and other published editions), served
 * as static JSON over jsDelivr's GitHub CDN. Nothing here is hardcoded
 * or generated — every book, chapter, and hadith is fetched live from
 * this source, matching the app's content-accuracy rule.
 *
 * There are 10 real books in this dataset (not more — verified against
 * the source's own editions.json), each in up to 10 language editions.
 */

const EDITIONS_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json";
const EDITION_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

export type HadithEditionInfo = {
  name: string; // e.g. "eng-bukhari" — the id used to fetch full text
  book: string; // book slug, e.g. "bukhari"
  language: string;
  direction: "ltr" | "rtl";
  comments: string;
};

export type HadithBookInfo = {
  slug: string;
  name: string;
  editions: HadithEditionInfo[];
};

async function getJSON<T>(url: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`Hadith source request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getHadithBooks(): Promise<HadithBookInfo[]> {
  const raw = await getJSON<Record<string, { name: string; collection: HadithEditionInfo[] }>>(EDITIONS_URL, 86400);
  return Object.entries(raw).map(([slug, book]) => ({
    slug,
    name: book.name,
    editions: book.collection
  }));
}

export async function getHadithBook(slug: string): Promise<HadithBookInfo | undefined> {
  const books = await getHadithBooks();
  return books.find((b) => b.slug === slug);
}

/** A label distinguishing the two Arabic editions most books have — the
 * plain text and a diacritics-stripped copy (kept for easier searching). */
export function editionLabel(edition: HadithEditionInfo): string {
  if (edition.language === "Arabic" && /diacritic/i.test(edition.comments)) return "Arabic (simplified)";
  return edition.language;
}

export type Hadith = {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
};

export type HadithEdition = {
  metadata: {
    name: string;
    sections: Record<string, string>;
    section_details: Record<string, { hadithnumber_first: number; hadithnumber_last: number }>;
  };
  hadiths: Hadith[];
};

export async function getHadithEdition(editionName: string): Promise<HadithEdition> {
  return getJSON<HadithEdition>(`${EDITION_BASE}/${editionName}.min.json`, 86400);
}

export function getSections(edition: HadithEdition) {
  return Object.entries(edition.metadata.sections)
    .filter(([number]) => number !== "0")
    .map(([number, title]) => {
      const range = edition.metadata.section_details[number];
      return {
        number: Number(number),
        title: title || `Chapter ${number}`,
        count: range ? Math.max(0, range.hadithnumber_last - range.hadithnumber_first + 1) : 0
      };
    })
    .filter((s) => s.count > 0);
}

export function getHadithsInSection(edition: HadithEdition, sectionNumber: number) {
  const range = edition.metadata.section_details[String(sectionNumber)];
  if (!range) return [];
  return edition.hadiths.filter(
    (h) => h.hadithnumber >= range.hadithnumber_first && h.hadithnumber <= range.hadithnumber_last
  );
}
