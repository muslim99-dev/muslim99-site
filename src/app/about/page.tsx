import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShieldCheck, Sparkles, Mail, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Eyebrow from "@/components/Eyebrow";
import { SITE_CONFIG } from "@/constants/site";
import { TEAM_MEMBERS } from "@/constants/team";

export const metadata: Metadata = {
  title: "About",
  description: `The story and the people behind ${SITE_CONFIG.name} — a free, quiet companion for the Quran, Hadith, and daily prayer.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Heart,
    title: "Built for worship, not engagement",
    body: "No ads, no trackers chasing your attention, no dark patterns. Just the Quran, the Hadith, and your prayer times — as quiet and distraction-free as we can make them.",
  },
  {
    icon: ShieldCheck,
    title: "Sources you can trust",
    body: "Every hadith carries its grading and reference. Every tafsir names its author. Where we're not certain of a source's rights, we leave it out rather than guess.",
  },
  {
    icon: Sparkles,
    title: "Free, and staying that way",
    body: "The app and this site are free to use. We'd rather grow slowly and keep it that way than paywall access to the Quran and Sunnah.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen pb-24 pt-32 sm:pt-40">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.14]" />
          <div className="relative mx-auto max-w-[1200px] px-6 pb-10 text-center">
            <div className="flex justify-center">
              <Eyebrow>Who we are</Eyebrow>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.8rem]" style={{ color: "var(--text)" }}>
              About {SITE_CONFIG.name}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {SITE_CONFIG.description}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="relative mx-auto max-w-[1200px] px-6">
          <div className="card-surface mx-auto max-w-3xl p-8 text-center sm:p-10">
            <h2 className="text-[20px] font-semibold" style={{ color: "var(--text)" }}>
              Why {SITE_CONFIG.name} exists
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
              We wanted one calm place to read the Quran with proper tafsir, browse the classical hadith
              collections with full narrator and grading detail, and know exactly when to pray — without
              ads, without noise, and without our attention being the product. {SITE_CONFIG.name} started as
              a small personal project and is still built the same way: one feature at a time, for people
              who just want to read and reflect.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="relative mx-auto mt-16 max-w-[1200px] px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="card-surface p-7">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  <v.icon size={22} />
                </div>
                <h3 className="mt-5 text-[17px] font-semibold" style={{ color: "var(--text)" }}>
                  {v.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="relative mx-auto mt-16 max-w-[1200px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[24px] font-semibold" style={{ color: "var(--text)" }}>
              Meet the team
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              A small team building {SITE_CONFIG.name} one release at a time.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
            {TEAM_MEMBERS.map((member) => (
              <Link
                key={member.slug}
                href={`/about/${member.slug}`}
                className="card-surface group flex items-center gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  {member.image ? (
                    <Image src={member.image} alt={member.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <UserIcon size={26} />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-[15.5px] font-semibold"
                    style={{ color: member.isPlaceholder ? "var(--muted)" : "var(--text)" }}
                  >
                    {member.name}
                  </p>
                  <p className="mt-0.5 truncate text-[13px]" style={{ color: "var(--primary)" }}>
                    {member.role}
                  </p>
                  {member.isPlaceholder && (
                    <span
                      className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
                      style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                    >
                      Open seat
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="relative mx-auto mt-16 max-w-[1200px] px-6">
          <div className="card-surface mx-auto flex max-w-3xl flex-col items-center gap-3 p-8 text-center sm:p-10">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "var(--soft)", color: "var(--primary)" }}
            >
              <Mail size={20} />
            </div>
            <h2 className="text-[19px] font-semibold" style={{ color: "var(--text)" }}>
              Get in touch
            </h2>
            <p className="max-w-md text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Questions, feedback, or found something worth fixing? We&rsquo;d like to hear about it.
            </p>
            <a
              href={`mailto:${SITE_CONFIG.contact.email}`}
              className="btn-primary mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold transition-transform hover:scale-[1.03]"
            >
              <Mail size={15} /> {SITE_CONFIG.contact.email}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
