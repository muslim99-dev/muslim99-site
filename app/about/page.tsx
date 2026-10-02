import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_FAQ, SITE_NAME, SITE_SECTIONS, SITE_URL, absoluteUrl } from "@/lib/site";
import { TAFSIRS, tafsirLanguages } from "@/lib/tafsir";
import { totalDuas } from "@/lib/duas";

export const metadata = {
  title: "About Muslim99 — Free Quran, Hadith, Tafsir & Duas Website",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/about" }
};

export default function About() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    url: absoluteUrl("/about"),
    description: SITE_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <JsonLd data={aboutJsonLd} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">About</p>
      <h1 className="mt-2 text-3xl font-semibold text-teal-dark">About Muslim99</h1>
      <p className="mt-5 text-[17px] leading-relaxed text-muted">{SITE_FAQ[0].a}</p>
      <p className="mt-4 leading-relaxed text-muted">
        Muslim99 is available at <a href={SITE_URL} className="text-primary-deep hover:underline">themuslim99.com</a>. It is built for
        everyday reading and study: every Qur&apos;an translation, hadith, tafsir and dua shows where it comes from — the
        collection, the book and number, the translator or the scholar — so readers can always check the source.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-teal-dark">What you can do on Muslim99</h2>
      <ul className="mt-4 space-y-3">
        {SITE_SECTIONS.map((s) => (
          <li key={s.path} className="rounded-card border border-border bg-white p-4">
            <Link href={s.path} className="font-medium text-teal-dark hover:text-primary-deep">
              {s.name}
            </Link>
            <p className="mt-1 text-sm text-muted">{s.description}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-teal-dark">By the numbers</h2>
      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-muted">
        <li>All 114 surahs of the Qur&apos;an with translations and recitations</li>
        <li>18 hadith collections, including the six canonical books (Kutub al-Sittah)</li>
        <li>
          {TAFSIRS.length} tafsir editions in {tafsirLanguages().length} languages
        </li>
        <li>{totalDuas} duas from the Qur&apos;an and Hisn al-Muslim, each with its reference</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-teal-dark">Frequently asked questions</h2>
      <div className="mt-4 space-y-5">
        {SITE_FAQ.map((f) => (
          <div key={f.q}>
            <h3 className="font-medium text-teal-dark">{f.q}</h3>
            <p className="mt-1 leading-relaxed text-muted">{f.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        Questions or feedback? <Link href="/contact" className="text-primary-deep hover:underline">Contact us</Link>.
      </p>
    </div>
  );
}
