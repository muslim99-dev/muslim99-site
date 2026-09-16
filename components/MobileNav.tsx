"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/quran", label: "Quran", icon: BookIcon },
  { href: "/prayer-times", label: "Prayer", icon: ClockIcon },
  { href: "/qibla", label: "Qibla", icon: CompassIcon },
  { href: "/settings", label: "More", icon: MoreIcon }
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-border bg-white/95 backdrop-blur md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
              active ? "text-primary-deep" : "text-muted"
            }`}
          >
            <Icon active={active} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function iconProps(active?: boolean) {
  return { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: active ? 2.2 : 1.8 } as const;
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-7.5Z" strokeLinejoin="round" />
    </svg>
  );
}
function BookIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M4 5.5c2-1 5-1 7 .5v13c-2-1.5-5-1.5-7-.5v-13Z" strokeLinejoin="round" />
      <path d="M20 5.5c-2-1-5-1-7 .5v13c2-1.5 5-1.5 7-.5v-13Z" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4l3 2" strokeLinecap="round" />
    </svg>
  );
}
function CompassIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-2 5-4 1.5L11 10l4-1Z" strokeLinejoin="round" />
    </svg>
  );
}
function MoreIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
