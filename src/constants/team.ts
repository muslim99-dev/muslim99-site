import { SITE_CONFIG } from "./site";

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  email?: string;
  url?: string;
  social?: { linkedin?: string; twitter?: string; github?: string };
  // True for seats not yet filled with a real person — the UI shows these
  // clearly as placeholders rather than inventing a name/photo for them.
  isPlaceholder?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: "talha-ghauri",
    name: SITE_CONFIG.creator.name,
    role: "Founder & Lead Developer",
    bio: "Builds and maintains Muslim99 — the app and this site.",
    image: SITE_CONFIG.creator.image,
    email: SITE_CONFIG.creator.email,
    url: SITE_CONFIG.creator.url,
  },
  {
    slug: "product-design",
    name: "Add a team member",
    role: "Product Designer",
    bio: "Open seat — swap in a real name, role, and photo.",
    isPlaceholder: true,
  },
  {
    slug: "islamic-content",
    name: "Add a team member",
    role: "Islamic Content Advisor",
    bio: "Open seat — swap in a real name, role, and photo.",
    isPlaceholder: true,
  },
  {
    slug: "community",
    name: "Add a team member",
    role: "Community & Support",
    bio: "Open seat — swap in a real name, role, and photo.",
    isPlaceholder: true,
  },
];

export function findTeamMember(slug: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.slug === slug);
}
