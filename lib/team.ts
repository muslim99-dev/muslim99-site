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

export const TEAM: TeamMember[] = [
  {
    name: "Hafiz Abdullah Qureshi",
    role: "Founder & Senior Developer",
    bio: "MERN stack developer who founded Muslim99 and builds its Qur'an, Hadith and Tafsir platform — free, authentic and open to everyone.",
    photo: "/team/hafiz-abdullah-qureshi.jpg",
    linkedin: "https://www.linkedin.com/in/abdullah-hamid-a83420241/"
  },
  {
    name: "Talha Ghauri",
    role: "CEO & Senior Developer",
    bio: "MERN stack developer leading Muslim99's direction and engineering, building a fast and reliable home for the Qur'an and Sunnah."
  },
  {
    name: "Ali Ghauri",
    role: "Lead Developer",
    bio: "MERN stack developer who leads development of Muslim99's features, from the readers and search to the tools Muslims use every day.",
    photo: "/team/ali-ghauri.jpg",
    linkedin: "https://www.linkedin.com/in/alighauri/"
  }
];
