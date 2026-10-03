/**
 * The Muslim99 team, shown as cards on the About page (and as Person
 * structured data for search engines). The section is hidden while the
 * list is empty.
 *
 * To add someone: put a square photo (at least 400×400, JPG/PNG/WebP) in
 * public/team/ and add an entry, e.g.
 *   {
 *     name: "Full Name",
 *     role: "Founder & Lead Developer",
 *     bio: "One or two sentences about their work on Muslim99.",
 *     photo: "/team/full-name.jpg",
 *     linkedin: "https://www.linkedin.com/in/their-profile/"
 *   }
 */

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  photo?: string; // path under /public, e.g. "/team/name.jpg"; initials are shown if missing
  linkedin?: string;
};

export const TEAM: TeamMember[] = [];
