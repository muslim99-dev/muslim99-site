import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import JsonLd from "@/components/JsonLd";
import SocialIcon from "@/components/SocialIcon";
import { IslamicPattern } from "@/components/hadith/HadithUI";
import { SITE_APPS, SITE_DESCRIPTION, SITE_HIGHLIGHTS, SITE_NAME, SITE_SOCIAL, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";

const PLAY_URL = SITE_APPS.android.url;

export const metadata = {
  title: "Download the Muslim99 App — Quran, Hadith, Qibla | Android & iPhone",
  description:
    "Get the Muslim99 app on Google Play: the Holy Quran with 130+ translations, 130+ tafsirs, 37+ hadith collections, prayer times, Qibla, duas and AI Islamic research. iPhone app coming soon to the App Store.",
  alternates: { canonical: "/download-app" },
  openGraph: {
    title: "Download the Muslim99 App",
    description: "Quran, Hadith, Tafsir, prayer times and Qibla in one app. Available on Google Play — App Store coming soon.",
    url: absoluteUrl("/download-app")
  }
};

const FEATURES = [
  { title: "The Holy Quran", text: "All 114 surahs with 130+ translations in 47 languages and ayah-by-ayah recitation.", icon: "book" },
  { title: "Hadith library", text: "37+ collections — Bukhari, Muslim, the Sunan and more — with references and grading.", icon: "scroll" },
  { title: "Tafsir", text: "130+ commentaries in 33 languages, from Ibn Kathir to Tafheem ul Quran.", icon: "layers" },
  { title: "Prayer times", text: "Accurate daily salah times for your location, Hanafi or Shafi'i Asr.", icon: "clock" },
  { title: "Qibla direction", text: "Find the direction of the Kaaba from wherever you are.", icon: "compass" },
  { title: "Duas & Azkar", text: "400+ authentic duas from the Quran and Hisn al-Muslim with references.", icon: "heart" },
  { title: "AI Islamic research", text: "Ask questions and get source-focused answers from the Quran, Tafsir and Hadith.", icon: "spark" },
  { title: "Hijri calendar", text: "Islamic dates alongside the Gregorian calendar, converted both ways.", icon: "calendar" }
];

const FAQ = [
  {
    q: "Is the Muslim99 app available on Android?",
    a: "Yes — the Muslim99 app is live on Google Play. Tap “Get it on Google Play” on this page, or scan the QR code with your phone's camera."
  },
  {
    q: "When will the iPhone app be available?",
    a: "The iPhone app is coming soon to the App Store. Follow Muslim99 on Instagram or Facebook to hear the moment it launches. Until then, the full Muslim99 website works in Safari on any iPhone."
  },
  {
    q: "Can I use Muslim99 without installing the app?",
    a: "Yes. Everything on Muslim99 — Quran, Hadith, Tafsir, duas, prayer times and Qibla — is also available on themuslim99.com in any phone or desktop browser."
  }
];

function Icon({ name }: { name: string }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (name) {
    case "book":
      return <svg {...p}><path d="M4 5.5c2-1 5-1 7 .5v13c-2-1.5-5-1.5-7-.5v-13Z" /><path d="M20 5.5c-2-1-5-1-7 .5v13c2-1.5 5-1.5 7-.5v-13Z" /></svg>;
    case "scroll":
      return <svg {...p}><path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7" /><path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" /><path d="M9 9h6M9 12.5h6M9 16h4" /></svg>;
    case "layers":
      return <svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
    case "clock":
      return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4l3 2" /></svg>;
    case "compass":
      return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="m15 9-2 5-4 1.5L11 10l4-1Z" /></svg>;
    case "heart":
      return <svg {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>;
    case "spark":
      return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>;
    default:
      return <svg {...p}><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>;
  }
}

/** Store badge in the style of the official ones (logo + two-line label). */
function StoreBadge({ kind, href }: { kind: "play" | "apple"; href: string | null }) {
  const label = kind === "play" ? { top: "GET IT ON", bottom: "Google Play" } : { top: href ? "Download on the" : "Coming soon on the", bottom: "App Store" };
  const logo =
    kind === "play" ? (
      <svg viewBox="0 0 24 26" className="h-7 w-7" aria-hidden>
        <path d="M1.2.6 13.4 12.8 1.2 25a1.6 1.6 0 0 1-.7-1.4V2a1.6 1.6 0 0 1 .7-1.4Z" fill="#00D7FE" />
        <path d="m17.5 8.7-4.1 4.1L1.2.6c.4-.2 1-.2 1.6.1l14.7 8Z" fill="#00F076" />
        <path d="m17.5 16.9-14.7 8c-.6.3-1.2.3-1.6.1l12.2-12.2 4.1 4.1Z" fill="#FF3A44" />
        <path d="m22 11.2-4.5-2.5-4.1 4.1 4.1 4.1 4.5-2.5c1.3-.8 1.3-2.4 0-3.2Z" fill="#FFD400" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.15-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.59-.75 2.99-.75 1.4 0 1.79.75 3.01.72 1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.45-3.71ZM14.08 5.85c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.02.08 2.07-.52 2.71-1.28Z" />
      </svg>
    );
  const body = (
    <>
      {logo}
      <span className="text-left leading-none">
        <span className="block text-[10px] font-medium tracking-wide opacity-80">{label.top}</span>
        <span className="mt-1 block text-[19px] font-semibold tracking-tight">{label.bottom}</span>
      </span>
    </>
  );
  const base = "relative inline-flex h-[58px] min-w-[190px] items-center gap-3 rounded-2xl px-5 transition-all";
  if (!href) {
    return (
      <span aria-disabled className={`${base} cursor-default border border-white/25 bg-white/5 text-white/70`}>
        {body}
        <span className="absolute -right-2 -top-2.5 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dark shadow">Soon</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-black text-white shadow-lg ring-1 ring-white/20 hover:-translate-y-0.5 hover:shadow-xl`}
    >
      {body}
    </a>
  );
}

/** Phone frame around a real screenshot of the app's home screen. */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[290px]">
      <div aria-hidden className="absolute -inset-10 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative rounded-[46px] border-[10px] border-[#0B2627] bg-[#0B2627] shadow-2xl">
        <div aria-hidden className="absolute left-1/2 top-1.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0B2627]" />
        <div className="overflow-hidden rounded-[36px] bg-white">
          <Image
            src="/app/muslim99-app-home.png"
            alt="Muslim99 Android app home screen: next prayer time, Quran, Qibla, Hadith and Prayer shortcuts, and verse of the day"
            width={720}
            height={1600}
            priority
            sizes="290px"
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default async function DownloadAppPage() {
  const qrSvg = PLAY_URL
    ? await QRCode.toString(PLAY_URL, { type: "svg", margin: 0, color: { dark: "#123E40", light: "#FFFFFF" } })
    : null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: `${SITE_NAME}: Quran, Hadith, Qibla`,
      operatingSystem: "Android",
      applicationCategory: "EducationalApplication",
      description: SITE_DESCRIPTION,
      image: absoluteUrl("/logo.png"),
      url: absoluteUrl("/download-app"),
      ...(PLAY_URL && { installUrl: PLAY_URL, downloadUrl: PLAY_URL }),
      publisher: { "@id": `${SITE_URL}/#organization` }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    }
  ];

  return (
    <div>
      <JsonLd data={jsonLd} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-dark via-[#0E5558] to-primary-deep text-white">
        <IslamicPattern className="absolute inset-0 text-white/[0.06]" />
        <div className="relative mx-auto grid max-w-app items-center gap-14 px-5 py-16 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F076]" />
              Now on Google Play
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl">
              A world of Islamic knowledge,
              <span className="block text-aqua">in your pocket.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/75">
              The Muslim99 app brings the Holy Quran, Hadith, Tafsir, prayer times, Qibla, duas and AI-powered Islamic research
              together — {SITE_TAGLINE.toLowerCase().replace(/\.$/, "")}.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StoreBadge kind="play" href={PLAY_URL} />
              <StoreBadge kind="apple" href={SITE_APPS.ios.url} />
            </div>

            {qrSvg && (
              <div className="mt-8 hidden items-center gap-4 sm:flex">
                <div className="h-[104px] w-[104px] rounded-2xl bg-white p-2.5 shadow-lg" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <div className="text-sm text-white/75">
                  <p className="font-semibold text-white">Scan to install</p>
                  <p className="mt-1 max-w-[220px] leading-snug">Point your Android phone&apos;s camera at the code to open Muslim99 on Google Play.</p>
                </div>
              </div>
            )}

            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {SITE_HIGHLIGHTS.map((h) => (
                <div key={h.label} className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                  <dd className="text-xl font-semibold">{h.value}</dd>
                  <dt className="text-[11px] leading-tight text-white/65">{h.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <PhoneMockup />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-app px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Inside the app</p>
          <h2 className="mt-2 text-3xl font-semibold text-teal-dark">Everything you need, every day</h2>
          <p className="mt-3 text-muted">Read, listen, search and study — with the source of every text shown.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-card border border-border bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-aqua text-primary-deep transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-4 font-semibold text-teal-dark">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-app gap-5 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <div className="relative overflow-hidden rounded-card border border-primary/30 bg-gradient-to-br from-white to-aqua/50 p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F8EE] px-3 py-1 text-xs font-semibold text-[#137A43]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954]" /> Available now
            </span>
            <h3 className="mt-4 text-2xl font-semibold text-teal-dark">Android</h3>
            <p className="mt-2 max-w-md text-muted">
              Install Muslim99: Quran, Hadith, Qibla from Google Play on your Android phone or tablet.
            </p>
            {PLAY_URL && (
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
              >
                Get it on Google Play <span aria-hidden>→</span>
              </a>
            )}
          </div>
          <div className="relative overflow-hidden rounded-card border border-border bg-bg p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-[#9A7B1C]">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Coming soon
            </span>
            <h3 className="mt-4 text-2xl font-semibold text-teal-dark">iPhone &amp; iPad</h3>
            <p className="mt-2 max-w-md text-muted">
              The App Store version is on its way. Follow us to hear the moment it launches — until then, the full Muslim99 website
              works beautifully in Safari.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SITE_SOCIAL.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-teal-dark transition-colors hover:border-primary hover:text-primary-deep"
                >
                  <SocialIcon name={s.name} className="h-4 w-4" />
                  Follow on {s.name}
                </a>
              ))}
              <Link href="/" className="px-2 text-sm font-medium text-primary-deep hover:underline">
                Use the website →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <h2 className="text-center text-2xl font-semibold text-teal-dark">Questions about the app</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-card border border-border bg-white p-5 open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-teal-dark">
                {f.q}
                <span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-teal-dark">
        <IslamicPattern className="absolute inset-0 text-white/[0.05]" />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center lg:px-8">
          <Image src="/logo.png" alt="Muslim99" width={64} height={64} className="mx-auto rounded-2xl shadow-lg" />
          <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Take Muslim99 with you</h2>
          <p className="mt-2 text-white/70">{SITE_TAGLINE}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <StoreBadge kind="play" href={PLAY_URL} />
            <StoreBadge kind="apple" href={SITE_APPS.ios.url} />
          </div>
        </div>
      </section>
    </div>
  );
}
