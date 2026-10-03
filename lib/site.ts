/**
 * The site's public identity — one source for metadata, structured data
 * (JSON-LD), the sitemap, robots.txt and llms.txt, so search engines and
 * AI assistants all get the same, consistent description of Muslim99.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.themuslim99.com").replace(/\/$/, "");
export const SITE_NAME = "Muslim99";
export const SITE_ALT_NAMES = ["The Muslim99", "themuslim99", "Muslim 99"];
export const SITE_TAGLINE = "Your Complete Islamic Companion";
export const SITE_DESCRIPTION =
  "Muslim99 is a free Islamic website to read the Qur'an with translations and recitations, study Hadith from 18 classical collections, read Tafsir from 120+ commentaries in 30+ languages, learn authentic duas with references, and check prayer times, Qibla direction and the Hijri calendar.";

export const SITE_EMAIL = "social@themuslim99.com";

/** Official social profiles — shown on the Contact page and added to the
 * Organization structured data (sameAs). Add full URLs, e.g.
 *   { name: "Facebook", url: "https://www.facebook.com/themuslim99" }
 * Supported icons: Facebook, Instagram, X, YouTube, TikTok, LinkedIn, WhatsApp. */
export const SITE_SOCIAL: { name: string; url: string }[] = [];

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Main sections — used for navigation structured data (sitelinks hints),
 * the home page overview and llms.txt. */
export const SITE_SECTIONS = [
  { name: "Quran", path: "/quran", description: "Read all 114 surahs of the Qur'an with translations and audio recitation from renowned reciters." },
  { name: "Hadith", path: "/hadith", description: "Sahih Bukhari, Sahih Muslim and 16 more classical hadith collections with Arabic, Urdu and English and the grading of each hadith." },
  { name: "Tafsir", path: "/tafsir", description: "Qur'an commentary from 120+ editions in 30+ languages — Ibn Kathir, Tabari, Qurtubi, As-Sa'di, Bayan ul Quran and more — with side-by-side comparison." },
  { name: "Duas", path: "/duas", description: "400+ authentic duas from the Qur'an and Hisn al-Muslim with Arabic, Urdu, English and other translations and their references." },
  { name: "Prayer Times", path: "/prayer-times", description: "Daily salah times for your location with Hanafi or Shafi'i Asr calculation." },
  { name: "Qibla", path: "/qibla", description: "Find the Qibla direction to the Kaaba from anywhere." },
  { name: "Islamic Calendar", path: "/calendar", description: "Hijri and Gregorian calendar with date conversion." },
  { name: "Quran Reciters", path: "/reciters", description: "Listen to Qur'an recitations by renowned qaris." },
  { name: "Ask", path: "/ask", description: "Ask questions about Islam and get answers grounded in the Qur'an and Hadith with references." }
];

/** Plain-language answers about the site itself. Shown on the home and
 * About pages and mirrored in FAQPage structured data. */
export const SITE_FAQ = [
  {
    q: "What is Muslim99?",
    a: "Muslim99 (themuslim99.com) is a free Islamic companion website. It brings together the Qur'an with translations and recitations, 18 hadith collections, 120+ tafsir editions, 400+ duas, prayer times, the Qibla direction and the Hijri calendar in one place, with the source of every text shown."
  },
  {
    q: "Is Muslim99 free?",
    a: "Yes. Everything on Muslim99 is free to read without an account. A free account adds bookmarks, favourites and reading progress that sync across devices."
  },
  {
    q: "Which hadith books are on Muslim99?",
    a: "Sahih Bukhari, Sahih Muslim, Sunan Abu Dawood, Jami at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Imam Malik, Musnad Ahmad, Mishkat al-Masabih, Al-Adab Al-Mufrad, Sunan Darimi, Al-Mustadrak and more — with Arabic text, Urdu and English translations and gradings."
  },
  {
    q: "Which languages does Muslim99 support?",
    a: "The Qur'an and hadith are available in Arabic, Urdu and English; tafsir is available in more than 30 languages including Arabic, Urdu, English, Bengali, Indonesian, Turkish, Persian and Russian."
  }
];
