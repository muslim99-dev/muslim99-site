import type { Metadata } from "next";
import { Inter, Amiri, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import SessionProvider from "@/components/SessionProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import JsonLd from "@/components/JsonLd";
import { SITE_ALT_NAMES, SITE_DESCRIPTION, SITE_NAME, SITE_SECTIONS, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-arabic" });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-urdu" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Muslim99",
    "themuslim99",
    "Quran online",
    "Hadith",
    "Sahih Bukhari",
    "Sahih Muslim",
    "Tafsir",
    "Tafsir Ibn Kathir",
    "Bayan ul Quran",
    "Duas",
    "Hisn al-Muslim",
    "prayer times",
    "Qibla direction",
    "Islamic calendar",
    "Urdu Quran",
    "Islamic website"
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {})
};

// Sitewide identity for search engines and AI assistants: who publishes the
// site, what it is called, and its main sections (sitelinks hints).
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_ALT_NAMES,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: SITE_DESCRIPTION
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: SITE_ALT_NAMES,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ["en", "ur", "ar"],
    publisher: { "@id": `${SITE_URL}/#organization` }
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} sections`,
    itemListElement: SITE_SECTIONS.map((s, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: s.name,
      description: s.description,
      url: absoluteUrl(s.path)
    }))
  }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable} ${nastaliq.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0">
        <JsonLd data={siteJsonLd} />
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <AnalyticsTracker />
        </SessionProvider>
      </body>
    </html>
  );
}
