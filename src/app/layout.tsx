import { Footer } from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import { SITE_CONFIG } from '@/constants/site';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import { MobileApplication, WithContext } from 'schema-dts';
import './globals.css';

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
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: '200',
});

const poppinsMedium = Poppins({
  variable: '--font-poppins-medium',
  subsets: ['latin'],
  weight: '400',
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <body className={`${poppins.variable} ${poppinsMedium.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
