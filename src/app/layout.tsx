import type { Metadata, Viewport } from "next";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "./globals.css";
import { MobileApplication, WithContext } from 'schema-dts';
import { ThemeProvider } from "@/components/ThemeProvider";
import AssistantWidget from "@/components/assistant/AssistantWidget";
import { SITE_CONFIG } from "@/constants/site";
import Script from "next/script";


const jsonLd: WithContext<MobileApplication> = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  url: SITE_CONFIG.url,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Android, iOS',
  downloadUrl: [SITE_CONFIG.links.playStore],
  author: {
    '@type': 'Person',
    name: SITE_CONFIG.creator.name,
    email: SITE_CONFIG.creator.email,
    url: SITE_CONFIG.creator.url,
    image: SITE_CONFIG.creator.image,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: SITE_CONFIG.title,
    template: `%s - ${SITE_CONFIG.name}`,
  },

  description: SITE_CONFIG.description,

  keywords: [...SITE_CONFIG.keywords],

  authors: [{ name: SITE_CONFIG.author }],
  publisher: SITE_CONFIG.creator.name,
  applicationName: SITE_CONFIG.name,

  verification: {
    google: 'iYL1LyyX4v1PupPnPKLErqOS_-RqIxW-xSxX-LHKwyE',
  },
  appLinks: {
    android: {
      package: 'com.muslim99',
      url: SITE_CONFIG.links.playStore,
      app_name: SITE_CONFIG.name,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },

  alternates: {
    canonical: SITE_CONFIG.url,
  },

  category: 'lifestyle',
};
export const viewport: Viewport = {
  themeColor: "#269398",
  width: "device-width",
  initialScale: 1,
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('muslim99-theme');
    var theme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <AssistantWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
