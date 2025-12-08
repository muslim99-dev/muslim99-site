export const APP_INFO = {
  name: 'Muslim99',
  tagline: 'Your Complete Islamic Companion',
  description:
    'Experience accurate prayer times, Quran recitation, Qibla direction, and Islamic knowledge all in one beautiful app. Stay connected with your faith, anytime, anywhere.',
} as const;

export const STORE_URLS = {
  playStore: 'https://play.google.com/store/apps/details?id=com.muslim99',
  appStore: 'https://apps.apple.com/app/muslim99/id123456789',
  huaweiAppGallery: 'https://appgallery.huawei.com/app/muslim99',
} as const;

export const CONTACT = {
  email: 'social@themuslim99.com',
  supportEmail: 'social@themuslim99.com',
  website: 'https://themuslim99.com',
} as const;

export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
  tiktok: 'https://tiktok.com',
  linkedin: 'https://linkedin.com',
} as const;

export const ROUTES = {
  home: '/',
  privacyPolicy: '/privacy-policy',
  downloadApp: '/download-app',
  termsOfService: '/terms-of-service',
  contact: '/contact',
  about: '/about',
} as const;

export const FEATURES = [
  {
    id: 1,
    icon: '🕌',
    title: 'Accurate Prayer Times',
    description:
      'Get precise prayer times based on your location with customizable notifications for each salah.',
  },
  {
    id: 2,
    icon: '📖',
    title: 'Quran & Translations',
    description:
      'Read and listen to the Holy Quran with translations in multiple languages and beautiful recitations.',
  },
  {
    id: 3,
    icon: '🧭',
    title: 'Qibla Direction',
    description:
      "Find the accurate Qibla direction from anywhere in the world using your device's compass.",
  },
  {
    id: 4,
    icon: '🤲',
    title: 'Duas & Supplications',
    description:
      'Access a comprehensive collection of daily duas and supplications for every occasion.',
  },
  {
    id: 5,
    icon: '📅',
    title: 'Islamic Calendar',
    description:
      'Stay updated with Islamic dates, Ramadan timings, and important Islamic events throughout the year.',
  },
  {
    id: 6,
    icon: '🌙',
    title: 'Daily Ayat',
    description:
      'Receive a beautiful verse from the Quran every day to inspire and strengthen your faith.',
  },
] as const;
