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
  { href: "/ask", label: "Ask" }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-app items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="Muslim99" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-semibold text-teal-dark">Muslim99</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-primary-deep transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted hover:text-primary-deep hover:border-primary transition-colors"
          >
            <SearchIcon />
          </button>
          <AccountMenu />
        </div>

        <button
          aria-label="Search"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted md:hidden"
        >
          <SearchIcon />
        </button>
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
