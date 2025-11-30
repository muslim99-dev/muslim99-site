import type { Metadata } from 'next';

export const DEFAULT_CONFIG = {
  baseUrl: 'https://themuslim99.com',
  siteName: 'Muslim99',

  defaultTitle: 'Muslim99 - Your Complete Islamic Companion',

  defaultDescription:
    'Experience accurate prayer times, Quran recitation, Qibla direction, and Islamic knowledge all in one beautiful app. Stay connected with your faith, anytime, anywhere.',

  defaultKeywords: [
    'Muslim99',
    'Islamic app',
    'Prayer times',
    'Salah times',
    'Quran app',
    'Qibla direction',
    'Islamic calendar',
    'Hijri calendar',
    'Muslim prayer app',
    'Adhan',
    'Azan',
    'Quran recitation',
    'Quran translation',
    'Daily Ayat',
    'Islamic duas',
    'Muslim app',
    'Ramadan app',
    'Prayer reminder',
    'Namaz timings',
    'Islamic knowledge',
    'Hadith',
    'Muslim companion',
    'Prayer notification',
    'Qibla compass',
    'Muslim lifestyle',
  ],

  author: 'Muslim99 Team',
  ogImage: '',
};

interface PageMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description = DEFAULT_CONFIG.defaultDescription,
  path = '/',
  image = DEFAULT_CONFIG.ogImage,
  keywords = DEFAULT_CONFIG.defaultKeywords,
  noIndex = false,
}: PageMetadataProps = {}): Metadata {
  const fullUrl = `${DEFAULT_CONFIG.baseUrl}${path}`;

  const pageTitle = title ? title : DEFAULT_CONFIG.defaultTitle;

  return {
    title: pageTitle,
    description,
    keywords,

    authors: [{ name: DEFAULT_CONFIG.author }],

    applicationName: DEFAULT_CONFIG.siteName,

    alternates: {
      canonical: fullUrl,
    },

    robots: {
      index: !noIndex,
      follow: true,
    },

    openGraph: {
      title: pageTitle,
      description,
      url: fullUrl,
      siteName: DEFAULT_CONFIG.siteName,
      type: 'website',
    },

    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
    },

    category: 'lifestyle',
  };
}
