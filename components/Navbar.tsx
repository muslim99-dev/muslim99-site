import Image from "next/image";
import Link from "next/link";
import AccountMenu from "@/components/AccountMenu";

const links = [
  { href: "/quran", label: "Quran" },
  { href: "/hadith", label: "Hadith" },
  { href: "/tafsir", label: "Tafsir" },
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/qibla", label: "Qibla" },
  { href: "/calendar", label: "Calendar" },
  { href: "/duas", label: "Duas" },
  { href: "/ask", label: "Ask" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-app items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="Muslim99" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-semibold text-teal-dark">Muslim99</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-primary-deep transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex shrink-0 items-center gap-3">
          <button
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted hover:text-primary-deep hover:border-primary transition-colors"
          >
            <SearchIcon />
          </button>
          <AccountMenu />
          <Link
            href="/download-app"
            aria-label="Download the Muslim99 app"
            title="Download the Muslim99 app"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm xl:px-4 transition-colors hover:bg-primary-deep"
          >
            <DownloadIcon />
            <span className="hidden xl:inline">Download Now</span>
            <span className="lg:hidden">Get App</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/download-app"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            <DownloadIcon />
            Get App
          </Link>
          <button
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted"
          >
            <SearchIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
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
