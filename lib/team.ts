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
  /** Sample entry — shown on the page but kept out of structured data. Remove when real details are added. */
  placeholder?: boolean;
};

// Placeholder cards — replace each with the real person's details and photo.
export const TEAM: TeamMember[] = [
  {
    name: "Founder Name",
    role: "Founder & CEO",
    bio: "Leads Muslim99's vision of authentic Islamic knowledge, free and open to everyone.",
    photo: "/team/placeholder.svg",
    linkedin: "https://www.linkedin.com/",
    placeholder: true
  },
  {
    name: "Developer Name",
    role: "Lead Developer",
    bio: "Builds the Qur'an, Hadith and Tafsir readers and keeps Muslim99 fast and reliable.",
    photo: "/team/placeholder.svg",
    linkedin: "https://www.linkedin.com/",
    placeholder: true
  },
  {
    name: "Scholar Name",
    role: "Islamic Content Reviewer",
    bio: "Reviews translations, sources and references so every text rests on firm ground.",
    photo: "/team/placeholder.svg",
    linkedin: "https://www.linkedin.com/",
    placeholder: true
  },
  {
    name: "Designer Name",
    role: "UI/UX Designer",
    bio: "Designs a calm, beautiful reading experience in every language Muslim99 supports.",
    photo: "/team/placeholder.svg",
    linkedin: "https://www.linkedin.com/",
    placeholder: true
  }
];
