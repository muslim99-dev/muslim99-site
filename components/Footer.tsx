import Image from "next/image";
import Link from "next/link";

const cols = [
  { title: "Explore", links: [["Quran", "/quran"], ["Hadith", "/hadith"], ["Tafsir", "/tafsir"], ["Duas", "/duas"]] },
  { title: "Tools", links: [["Prayer Times", "/prayer-times"], ["Qibla", "/qibla"], ["Calendar", "/calendar"], ["Reciters", "/reciters"]] },
  { title: "Muslim99", links: [["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "/contact"]] }
];

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-8 py-12 grid grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Muslim99" width={34} height={34} className="rounded-lg" />
            <span className="text-lg font-semibold text-teal-dark">Muslim99</span>
          </div>
          <p className="mt-3 text-sm text-muted max-w-xs">Your Complete Islamic Companion</p>
          <p className="mt-6 text-xs text-muted max-w-sm">
            Quran text, translations, and audio are served through licensed and openly-published sources with
            attribution shown throughout the app.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-medium text-teal-dark">{c.title}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary-deep transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Muslim99. Content sourced with attribution — see individual pages for details.
      </div>
    </footer>
  );
}
