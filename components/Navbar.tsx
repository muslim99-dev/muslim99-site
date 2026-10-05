import Image from "next/image";
import Link from "next/link";
import AccountMenu from "@/components/AccountMenu";
import { ASK_ENABLED } from "@/lib/site";
import { StreakBadge } from "@/components/streak/StreakProvider";

const ALL_LINKS = [
  { href: "/quran", label: "Quran" },
  { href: "/hadith", label: "Hadith" },
  { href: "/tafsir", label: "Tafsir" },
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/qibla", label: "Qibla" },
  { href: "/calendar", label: "Calendar" },
  { href: "/duas", label: "Duas" },
  { href: "/ask", label: "Ask" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

const links = ALL_LINKS.filter((l) => ASK_ENABLED || l.href !== "/ask");


export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      {/* Logo, menu and buttons spaced evenly: the gap from the logo to the menu
          equals the gap from the menu to the buttons. */}
      <div className="mx-auto flex h-16 max-w-app items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.png" alt="Muslim99" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-semibold text-teal-dark">Muslim99</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-muted lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-primary-deep transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {/* No room for the badge beside the full menu on small laptops — it's in the account menu there. */}
          <StreakBadge className="lg:hidden xl:block" />
          <AccountMenu />
          <Link
            href="/download-app"
            aria-label="Download the Muslim99 app"
            title="Download the Muslim99 app"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-deep xl:px-4"
          >
            <DownloadIcon />
            <span className="hidden xl:inline">Download App</span>
            <span className="lg:hidden">Get App</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <StreakBadge />
          <Link
            href="/download-app"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            <DownloadIcon />
            Get App
          </Link>
        </div>
      </div>
    </header>
  );
}


function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5" />
      <path d="M5 19h14" />
    </svg>
  );
}
