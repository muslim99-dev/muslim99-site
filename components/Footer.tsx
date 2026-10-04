import Image from "next/image";
import Link from "next/link";
import SocialIcon from "@/components/SocialIcon";
import { SITE_EMAIL, SITE_NAME, SITE_SOCIAL, SITE_TAGLINE } from "@/lib/site";

const cols = [
  { title: "Explore", links: [["Quran", "/quran"], ["Hadith", "/hadith"], ["Tafsir", "/tafsir"], ["Duas", "/duas"]] },
  { title: "Tools", links: [["Prayer Times", "/prayer-times"], ["Qibla", "/qibla"], ["Calendar", "/calendar"], ["Reciters", "/reciters"]] },
  { title: "Muslim99", links: [["About", "/about"], ["Get the App", "/download-app"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "/contact"]] }
];

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-white">
      <div className="mx-auto max-w-app px-8 py-12 grid grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Muslim99" width={34} height={34} className="rounded-lg" />
            <span className="text-lg font-semibold text-teal-dark">Muslim99</span>
          </div>
          <p className="mt-3 text-sm text-muted max-w-xs">{SITE_TAGLINE}</p>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-dark transition-colors hover:text-primary-deep"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
              <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
            </svg>
            {SITE_EMAIL}
          </a>
          {SITE_SOCIAL.length > 0 && (
            <div className="mt-4 flex gap-2">
              {SITE_SOCIAL.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={`${SITE_NAME} on ${s.name}`}
                  title={s.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-teal-dark transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <SocialIcon name={s.name} className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
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
