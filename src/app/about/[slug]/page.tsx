import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Mail, Globe, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LinkedinIcon, XIcon, GithubIcon } from "@/components/SocialIcons";
import { TEAM_MEMBERS, findTeamMember } from "@/constants/team";

export async function generateStaticParams() {
  return TEAM_MEMBERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/about/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const member = findTeamMember(slug);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} — ${member.role}`,
    description: member.bio,
    alternates: { canonical: `/about/${member.slug}` },
  };
}

const SOCIAL_LINKS: { key: "linkedin" | "twitter" | "github"; label: string; Icon: typeof LinkedinIcon }[] = [
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "twitter", label: "X (Twitter)", Icon: XIcon },
  { key: "github", label: "GitHub", Icon: GithubIcon },
];

export default async function TeamMemberPage(props: PageProps<"/about/[slug]">) {
  const { slug } = await props.params;
  const member = findTeamMember(slug);
  if (!member) notFound();

  return (
    <>
      <Navbar backHref="/about" backLabel="Back to about" />
      <main className="relative min-h-screen pb-24 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.14]" />
        <div className="relative mx-auto max-w-xl px-6">
          <div className="card-surface overflow-hidden p-0">
            {/* Banner */}
            <div className="relative h-28 sm:h-32" style={{ background: "var(--grad-hero)" }}>
              <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.16]" />
            </div>

            <div className="px-6 pb-8 text-center sm:px-10 sm:pb-10">
              {/* Avatar overlapping the banner */}
              <div className="relative -mt-12 flex justify-center sm:-mt-14">
                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 sm:h-28 sm:w-28"
                  style={{ background: "var(--soft)", color: "var(--primary)", borderColor: "var(--card)" }}
                >
                  {member.image ? (
                    <Image src={member.image} alt={member.name} fill sizes="112px" className="object-cover" />
                  ) : (
                    <UserIcon size={36} />
                  )}
                </div>
              </div>

              <h1
                className="mt-4 text-[22px] font-semibold"
                style={{ color: member.isPlaceholder ? "var(--muted)" : "var(--text)" }}
              >
                {member.name}
              </h1>

              <div className="mt-1.5 flex items-center justify-center gap-2">
                <p className="text-[13.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--primary)" }}>
                  {member.role}
                </p>
                {member.isPlaceholder && (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                  >
                    Open seat
                  </span>
                )}
              </div>

              <p className="mx-auto mt-4 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {member.bio}
              </p>

              {(member.email || member.url || member.social) && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t pt-6" style={{ borderColor: "var(--hair)" }}>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      aria-label="Email"
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
                      style={{ background: "var(--soft)", color: "var(--primary)" }}
                    >
                      <Mail size={17} />
                    </a>
                  )}
                  {member.url && (
                    <a
                      href={member.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Website"
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
                      style={{ background: "var(--soft)", color: "var(--primary)" }}
                    >
                      <Globe size={17} />
                    </a>
                  )}
                  {SOCIAL_LINKS.map(({ key, label, Icon }) => {
                    const href = member.social?.[key];
                    if (!href) return null;
                    return (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
                        style={{ background: "var(--soft)", color: "var(--primary)" }}
                      >
                        <Icon size={17} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
