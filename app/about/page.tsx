import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import TeamCard from "@/components/TeamCard";
import { IslamicPattern } from "@/components/hadith/HadithUI";
import { SITE_DESCRIPTION, SITE_FAQ, SITE_NAME, SITE_SECTIONS, SITE_URL, absoluteUrl } from "@/lib/site";
import { TEAM } from "@/lib/team";
import { TAFSIRS, tafsirLanguages } from "@/lib/tafsir";
import { totalDuas } from "@/lib/duas";
import { getCollections } from "@/lib/hadith";

export const metadata = {
  title: "About Muslim99 — Free Quran, Hadith, Tafsir & Duas Website",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/about" }
};

const PRINCIPLES = [
  {
    title: "Every text has a source",
    body: "Each translation, hadith, tafsir and dua shows where it comes from — the collection and number, the book, the translator or the scholar — so you can always check it.",
    icon: (
      <path d="M9 12l2 2 4-4M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    )
  },
  {
    title: "Free for everyone",
    body: "Everything can be read without an account or payment. A free account only adds bookmarks, favourites and reading progress that follow you across devices.",
    icon: <path d="M12 21s-7.5-4.6-9.3-9.4C1.5 8.3 3.6 5 7 5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6C19.5 16.4 12 21 12 21z" />
  },
  {
    title: "In your language",
    body: "Arabic, Urdu and English throughout, and tafsir in more than thirty languages — so the meaning of the Qur'an reaches readers wherever they are.",
    icon: (
      <path d="M3 5h12M9 3v2m1.05 9.5A18 18 0 0 1 6.4 9M13 21l5-10 5 10m-8.5-3h7M11.3 5C10.1 9.6 7.4 13.5 3.4 16" />
    )
  },
  {
    title: "Respectful of privacy",
    body: "No IP addresses or personal details are stored to measure visits — only anonymous page counts that help us improve the site.",
    icon: <path d="M12 3a4 4 0 0 0-4 4v3H6v11h12V10h-2V7a4 4 0 0 0-4-4zm-2 7V7a2 2 0 1 1 4 0v3h-4z" />
  }
];

export default async function About() {
  const collections = await getCollections().catch(() => []);
  const hadiths = collections.reduce((n, c) => n + c.total_hadiths, 0);
  const stats = [
    { value: "114", label: "Surahs of the Qur'an" },
    { value: String(collections.length || 18), label: "Hadith collections" },
    { value: hadiths ? `${Math.floor(hadiths / 1000)}k+` : "90k+", label: "Hadiths" },
    { value: String(TAFSIRS.length), label: "Tafsir editions" },
    { value: String(tafsirLanguages().length), label: "Languages" },
    { value: String(totalDuas), label: "Duas with references" }
  ];

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    url: absoluteUrl("/about"),
    description: SITE_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    ...(TEAM.length
      ? {
          mentions: TEAM.map((m) => ({
            "@type": "Person",
            name: m.name,
            jobTitle: m.role,
            worksFor: { "@id": `${SITE_URL}/#organization` },
            ...(m.photo ? { image: absoluteUrl(m.photo) } : {}),
            ...(m.linkedin ? { sameAs: [m.linkedin] } : {})
          }))
        }
      : {})
  };

  return (
    <div>
      <JsonLd data={aboutJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-dark via-[#0E5558] to-primary-deep text-white">
        <IslamicPattern className="absolute inset-0 text-white/[0.07]" />
        <div className="relative mx-auto max-w-app px-5 py-20 text-center lg:px-8 lg:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">About us</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Bringing the Qur&apos;an and Sunnah closer to every heart
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-white/80">
            {SITE_NAME} is a free Islamic companion — the Qur&apos;an, Hadith, Tafsir and Duas, with prayer times and the
            Qibla — gathered in one calm, trustworthy place.
          </p>
          <figure className="mx-auto mt-10 max-w-xl rounded-card border border-white/15 bg-white/[0.07] px-6 py-6 backdrop-blur-sm">
            <p dir="rtl" lang="ar" className="font-quran text-3xl leading-loose text-white">
              ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ
            </p>
            <figcaption className="mt-2 text-sm text-white/75">
              &ldquo;Read in the name of your Lord who created.&rdquo; <span className="text-gold">— Surah Al-&lsquo;Alaq 96:1</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Mission + numbers */}
      <section className="mx-auto max-w-app px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Our mission</p>
            <h2 className="mt-2 text-3xl font-semibold leading-snug text-teal-dark">
              Authentic knowledge, beautifully presented, open to all
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">{SITE_FAQ[0].a}</p>
            <p className="mt-4 leading-relaxed text-muted">
              We built {SITE_NAME} for the reader who wants more than a verse on a screen: the original Arabic, a faithful
              translation in their own language, the words of the great scholars of tafsir, and the hadith of the Prophet ﷺ
              — each with its source, so learning always rests on firm ground.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quran" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-deep">
                Start reading
              </Link>
              <Link href="/contact" className="rounded-full border border-border bg-white px-6 py-3 text-sm font-medium text-teal-dark transition-colors hover:border-primary">
                Get in touch
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-card border border-border bg-white p-5 text-center shadow-sm">
                <dd className="text-3xl font-semibold text-teal-dark">{s.value}</dd>
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What we offer */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-app px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">What you&apos;ll find</p>
            <h2 className="mt-2 text-3xl font-semibold text-teal-dark">Everything for your daily connection with your Deen</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_SECTIONS.map((s, i) => (
              <Link
                key={s.path}
                href={s.path}
                className="group flex gap-4 rounded-card border border-border bg-bg p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-card"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-dark text-sm font-semibold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-semibold text-teal-dark group-hover:text-primary-deep">{s.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{s.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-app px-5 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Our principles</p>
          <h2 className="mt-2 text-3xl font-semibold text-teal-dark">What we hold ourselves to</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-card border border-border bg-white p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua text-primary-deep">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {p.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-teal-dark">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      {TEAM.length > 0 && (
        <section className="border-y border-border bg-white" aria-labelledby="team-heading">
          <div className="mx-auto max-w-app px-5 py-20 lg:px-8">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Our team</p>
              <h2 id="team-heading" className="mt-2 text-3xl font-semibold text-teal-dark">
                The people behind {SITE_NAME}
              </h2>
            </div>
            <div className={`mx-auto mt-10 grid gap-6 sm:grid-cols-2 ${TEAM.length >= 3 ? "lg:grid-cols-3" : "max-w-3xl"}`}>
              {TEAM.map((m) => (
                <TeamCard key={m.name} member={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center text-3xl font-semibold text-teal-dark">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {SITE_FAQ.map((f) => (
            <details key={f.q} className="group rounded-card border border-border bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-teal-dark">
                {f.q}
                <span aria-hidden className="text-xl leading-none text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Make {SITE_NAME} part of your daily journey</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">Free, with sources, in your language — at themuslim99.com.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/quran" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-deep">
              Read the Qur&apos;an
            </Link>
            <Link href="/hadith" className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Explore Hadith
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
