import Image from "next/image";
import type { TeamMember } from "@/lib/team";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/** A team member card: photo (or initials), name, role, short bio, LinkedIn. */
export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group relative flex h-full flex-col items-center overflow-hidden rounded-card border border-border bg-white px-6 pb-6 pt-10 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-card">
      <span aria-hidden className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-teal-dark via-[#0E5558] to-primary-deep" />
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-aqua ring-4 ring-white shadow-card">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`${member.name}, ${member.role}`}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized={member.photo.endsWith(".svg")}
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-3xl font-semibold text-primary-deep">{initials(member.name)}</span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-teal-dark">{member.name}</h3>
      <p className="mt-0.5 text-sm font-medium text-gold">{member.role}</p>
      {member.bio && <p className="mb-5 mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>}
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="mt-auto inline-flex translate-y-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-[#0A66C2] transition-colors hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
        >
          <LinkedInIcon />
          LinkedIn
        </a>
      )}
    </article>
  );
}
