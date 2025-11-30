import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import { DEFAULT_CONFIG } from '@/utils/metadata';

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
  metadataBase: new URL(DEFAULT_CONFIG.baseUrl),

  title: {
    default: DEFAULT_CONFIG.defaultTitle,
    template: `%s - ${DEFAULT_CONFIG.siteName}`,
  },

  description: DEFAULT_CONFIG.defaultDescription,

  keywords: DEFAULT_CONFIG.defaultKeywords,

  authors: [{ name: DEFAULT_CONFIG.author }],

  applicationName: DEFAULT_CONFIG.siteName,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  manifest: '/site.webmanifest',

  openGraph: {
    title: DEFAULT_CONFIG.defaultTitle,
    description: DEFAULT_CONFIG.defaultDescription,
    url: DEFAULT_CONFIG.baseUrl,
    siteName: DEFAULT_CONFIG.siteName,
    type: 'website',
  },

  twitter: {
    card: 'summary',
    title: DEFAULT_CONFIG.defaultTitle,
    description: DEFAULT_CONFIG.defaultDescription,
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
      <body className={`${poppins.variable} ${poppinsMedium.variable} antialiased`}>
        <Header />
        {children}

        <Footer />
      </body>
    </html>
  );
}
