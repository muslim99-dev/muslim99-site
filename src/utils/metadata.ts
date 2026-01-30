import { SITE_CONFIG } from '@/constants/site';
import type { Metadata } from 'next';

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
  description = SITE_CONFIG.description,
  path = '/',
  image = SITE_CONFIG.ogImage,
  keywords = SITE_CONFIG.keywords,
  noIndex = false,
}: PageMetadataProps = {}): Metadata {
  const fullUrl = `${SITE_CONFIG.url}${path}`;

  const pageTitle = title ? title : SITE_CONFIG.title;

  return {
    title: pageTitle,
    description,
    keywords,

    authors: [{ name: SITE_CONFIG.author }],

    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
      },
    },

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: fullUrl,
      title: pageTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [image],
    },

    alternates: {
      canonical: fullUrl,
    },

    category: 'lifestyle',
  };
}
