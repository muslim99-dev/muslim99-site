"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SocialIcon from "@/components/SocialIcon";
import { SITE_EMAIL, SITE_NAME, SITE_SOCIAL } from "@/lib/site";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/quran", label: "Quran", icon: BookIcon },
  { href: "/hadith", label: "Hadith", icon: ScrollIcon },
  { href: "/tafsir", label: "Tafsir", icon: TafsirIcon }
];

const more = [
  { href: "/prayer-times", label: "Prayer Times", icon: ClockIcon },
  { href: "/qibla", label: "Qibla", icon: CompassIcon },
  { href: "/duas", label: "Duas", icon: HandsIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/ask", label: "Ask", icon: ChatIcon },
  { href: "/blog", label: "Blog", icon: PenIcon },
  { href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
  { href: "/about", label: "About", icon: InfoIcon },
  { href: "/contact", label: "Contact", icon: MailIcon }
];

const isActive = (pathname: string, href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = more.some((m) => isActive(pathname, m.href)) || isActive(pathname, "/settings");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const tab = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${active ? "text-primary-deep font-medium" : "text-muted"}`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="More sections">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-teal-dark/30 backdrop-blur-[1px]" />
          <div className="absolute inset-x-3 bottom-[4.5rem] rounded-card border border-border bg-white p-3 shadow-card">
            <div className="grid grid-cols-3 gap-2">
              {more.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs transition-colors ${
                      active ? "bg-aqua text-primary-deep font-medium" : "text-teal-dark hover:bg-bg"
                    }`}
                  >
                    <Icon active={active} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/download-app"
              className="mt-2 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-teal-dark to-primary-deep px-4 py-3 text-white"
            >
              <PhoneIcon active />
              <span className="flex-1 text-sm font-semibold">Get the Muslim99 app</span>
              <span className="text-[11px] text-white/75">Google Play →</span>
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border px-1 pt-3">
              <a href={`mailto:${SITE_EMAIL}`} className="min-w-0 truncate text-xs font-medium text-teal-dark">
                {SITE_EMAIL}
              </a>
              <div className="flex shrink-0 gap-2">
                <Link href="/settings" aria-label="Settings" title="Settings" className="grid h-9 w-9 place-items-center rounded-full border border-border text-teal-dark">
                  <GearIcon />
                </Link>
                {SITE_SOCIAL.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={`${SITE_NAME} on ${s.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-teal-dark"
                  >
                    <SocialIcon name={s.name} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-border bg-white/95 backdrop-blur md:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active = !open && isActive(pathname, href);
          return (
            <Link key={href} href={href} className={tab(active)}>
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
        <button onClick={() => setOpen(!open)} aria-expanded={open} className={tab(open || moreActive)}>
          {open ? <CloseIcon active /> : <MoreIcon active={moreActive} />}
          More
        </button>
      </nav>
    </>
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
function ScrollIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7" strokeLinejoin="round" />
      <path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" strokeLinejoin="round" />
      <path d="M9 9h6M9 12.5h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}
function TafsirIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M5 4.5h9l5 5V19a.5.5 0 0 1-.5.5h-13A.5.5 0 0 1 5 19V4.5Z" strokeLinejoin="round" />
      <path d="M14 4.5V9.5h5" strokeLinejoin="round" />
      <path d="M8.5 13h7M8.5 16h5" strokeLinecap="round" />
    </svg>
  );
}
function HandsIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M12 20s-6-3.5-6-9a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 5.5-6 9-6 9Z" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  );
}
function BookmarkIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  );
}
function InfoIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}
function MailIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
    </svg>
  );
}
function GearIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" strokeLinecap="round" />
    </svg>
  );
}
function PhoneIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 18h2" strokeLinecap="round" />
    </svg>
  );
}
function PenIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" strokeLinejoin="round" />
      <path d="m14.5 7.5 3 3" />
    </svg>
  );
}
function CloseIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
