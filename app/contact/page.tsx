import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import CopyEmail from "@/components/CopyEmail";
import SocialIcon from "@/components/SocialIcon";
import JsonLd from "@/components/JsonLd";
import { IslamicPattern } from "@/components/hadith/HadithUI";
import { SITE_EMAIL, SITE_NAME, SITE_SOCIAL, SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "Contact Muslim99 — Questions, Feedback & Corrections",
  description: `Contact the ${SITE_NAME} team: send a question, feedback or a correction through the form, or email ${SITE_EMAIL}.`,
  alternates: { canonical: "/contact" }
};

const TOPICS = [
  {
    title: "Questions & feedback",
    body: "Ideas to improve Muslim99, features you'd like, or anything that didn't work as expected."
  },
  {
    title: "Report a mistake",
    body: "Spotted an error in a translation, reference or grading? Send the page link and we'll check the source."
  },
  {
    title: "Partnerships",
    body: "Scholars, institutions and developers who want to work with us on authentic Islamic content."
  }
];

export default function Contact() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE_NAME}`,
    url: absoluteUrl("/contact"),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` }
  };

  return (
    <div>
      <JsonLd data={contactJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-dark via-[#0E5558] to-primary-deep text-white">
        <IslamicPattern className="absolute inset-0 text-white/[0.07]" />
        <div className="relative mx-auto max-w-app px-5 pb-28 pt-16 text-center lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Contact us</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">We&apos;d love to hear from you</h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-white/80">
            Questions, feedback or a correction — write to the {SITE_NAME} team and we&apos;ll get back to you, in sha&apos; Allah.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-16 max-w-app px-5 pb-20 lg:px-8">
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Contact details */}
          <aside className="space-y-4">
            <div className="rounded-card border border-border bg-white p-6 shadow-card">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua text-primary-deep" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 6.5l8.5 6 8.5-6" />
                </svg>
              </span>
              <h2 className="mt-4 font-semibold text-teal-dark">Email us</h2>
              <p className="mt-1 text-sm text-muted">For anything at all — we read every message.</p>
              <a href={`mailto:${SITE_EMAIL}`} className="mt-3 block break-all text-lg font-semibold text-primary-deep hover:underline">
                {SITE_EMAIL}
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-deep"
                >
                  Open email app
                </a>
                <CopyEmail email={SITE_EMAIL} />
              </div>
            </div>

            {SITE_SOCIAL.length > 0 && (
              <div className="rounded-card border border-border bg-white p-6">
                <h2 className="font-semibold text-teal-dark">Follow {SITE_NAME}</h2>
                <p className="mt-1 text-sm text-muted">Daily verses, hadith and updates.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SITE_SOCIAL.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      aria-label={`${SITE_NAME} on ${s.name}`}
                      title={s.name}
                      className="grid h-11 w-11 place-items-center rounded-full border border-border text-teal-dark transition-colors hover:border-primary hover:bg-primary hover:text-white"
                    >
                      <SocialIcon name={s.name} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-card border border-border bg-white p-6">
              <h2 className="font-semibold text-teal-dark">What can we help with?</h2>
              <ul className="mt-4 space-y-4">
                {TOPICS.map((t) => (
                  <li key={t.title} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                    <span>
                      <span className="block text-sm font-medium text-teal-dark">{t.title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">{t.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
                Looking for answers about the site? See the{" "}
                <Link href="/about" className="font-medium text-primary-deep hover:underline">
                  About page and FAQ
                </Link>
                .
              </p>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:pt-0">
            <ContactForm />
            <p className="mt-4 px-2 text-xs leading-relaxed text-muted">
              Your name and email are used only to reply to you. They are never shared or used for marketing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
