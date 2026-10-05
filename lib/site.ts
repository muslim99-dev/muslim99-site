/**
 * The site's public identity — one source for metadata, structured data
 * (JSON-LD), the sitemap, robots.txt and llms.txt, so search engines and
 * AI assistants all get the same, consistent description of Muslim99.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.themuslim99.com").replace(/\/$/, "");
export const SITE_NAME = "Muslim99";
export const SITE_ALT_NAMES = ["The Muslim99", "themuslim99", "Muslim 99"];
export const SITE_TAGLINE = "One App. A World of Islamic Knowledge.";
export const SITE_DESCRIPTION =
  "Muslim99 is an AI-powered Islamic knowledge and research platform founded by Hafiz Abdullah Qureshi: the Holy Quran with 130+ translations in 47 languages, 130+ tafsirs in 33 languages, 37+ hadith collections, 38+ Quran reciters, AI Islamic research, duas, azkar, prayer times, Qibla and the Hijri calendar.";

/** Headline numbers, used in the overview, structured data and llms.txt. */
export const SITE_HIGHLIGHTS = [
  { value: "130+", label: "Quran tafsirs", detail: "in 33 languages" },
  { value: "130+", label: "Quran translations", detail: "in 47 languages" },
  { value: "37+", label: "Hadith collections", detail: "references & grading" },
  { value: "38+", label: "Quran reciters", detail: "ayah-by-ayah recitation" }
];

export const SITE_FOUNDER = {
  name: "Hafiz Abdullah Qureshi",
  jobTitle: "Founder",
  linkedin: "https://www.linkedin.com/in/hafiz-abdullah-qureshi-a83420241/",
  image: "/team/hafiz-abdullah-qureshi.jpg"
};

/** The full description of the platform — the text search engines and AI
 * assistants are given to summarise (home page "What is Muslim99?",
 * llms.txt). Keep it factual. */
export const SITE_OVERVIEW = [
  "Muslim99 is an advanced AI-powered Islamic knowledge and research platform, founded by Hafiz Abdullah Qureshi, that brings authentic Islamic knowledge, Quran research, Hadith collections, Tafsir, translations, Quran recitation, daily Islamic tools and intelligent AI-powered features together in one web and mobile platform.",
  "It is built around one vision — “One App. A World of Islamic Knowledge.” — making it easier for Muslims around the world to read, listen, search, study, understand and research Islamic knowledge using traditional Islamic sources combined with modern technology.",
  "Muslim99 offers 130+ authentic Quran tafsirs from respected scholars and classical sources in 33 languages, 130+ Quran translations by different authors in 47 languages, 37+ authentic hadith collections with books, chapters, references and grading, and 38+ Quran reciter voices. Its AI-powered search and research gives source-focused answers with references from the Quran, Tafsir and Hadith."
];

export const SITE_FEATURES = [
  "Complete Holy Quran",
  "130+ authentic Tafsirs in 33 languages",
  "130+ Quran translations by different authors in 47 languages",
  "37+ authentic Hadith collection books",
  "38+ Quran reciter voices",
  "AI-powered Islamic knowledge assistant and research",
  "Quran and Hadith search",
  "Ayah-by-ayah Quran reading and listening",
  "Hadith browsing and research",
  "Duas collection and daily Azkar",
  "Prayer times",
  "Qibla direction",
  "Hijri / Islamic calendar",
  "Bookmarks and saved content",
  "Multi-language Islamic content",
  "Web and mobile access"
];

export const SITE_EMAIL = "social@themuslim99.com";

/** Official social profiles — shown on the Contact page and added to the
 * Organization structured data (sameAs). Add full URLs, e.g.
 *   { name: "Facebook", url: "https://www.facebook.com/themuslim99" }
 * Supported icons: Facebook, Instagram, X, YouTube, TikTok, LinkedIn, WhatsApp. */
export const SITE_SOCIAL: { name: string; url: string }[] = [
  { name: "Instagram", url: "https://www.instagram.com/themuslim99_/" },
  { name: "Facebook", url: "https://www.facebook.com/profile.php?id=61594990950125" },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/themuslim99/" }
];

/** Mobile apps. `url: null` = not released yet (shown as "Coming soon"). */
export const SITE_APPS = {
  android: { store: "Google Play", url: "https://play.google.com/store/apps/details?id=com.muslim99" as string | null },
  ios: { store: "App Store", url: null as string | null }
};

/** The Ask (AI) section is hidden for now: no links, the page redirects
 * home and its API is off. Set to true to bring it back. */
export const ASK_ENABLED = false;

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Main sections — used for navigation structured data (sitelinks hints),
 * the home page overview and llms.txt. */
const ALL_SECTIONS = [
  { name: "Quran", path: "/quran", short: "All 114 surahs, 130+ translations and recitations.", description: "Read all 114 surahs of the Holy Quran with 130+ translations in 47 languages and ayah-by-ayah recitation from 38+ reciters." },
  { name: "Hadith", path: "/hadith", short: "37+ collections with references and grading.", description: "37+ hadith collections — Sahih Bukhari, Sahih Muslim, the Sunan, Musnad Ahmad, Riyad as-Salihin and more — with Arabic, Urdu and English, references and grading." },
  { name: "Tafsir", path: "/tafsir", short: "130+ tafsirs in 33 languages.", description: "130+ Quran tafsirs in 33 languages — Ibn Kathir, Tabari, Qurtubi, As-Sa'di, Tafheem ul Quran, Bayan ul Quran and more — with side-by-side comparison." },
  { name: "Duas", path: "/duas", short: "400+ authentic duas with references.", description: "400+ authentic duas from the Qur'an and Hisn al-Muslim with Arabic, Urdu, English and other translations and their references." },
  { name: "Prayer Times", path: "/prayer-times", short: "Daily salah times for your location.", description: "Daily salah times for your location with Hanafi or Shafi'i Asr calculation." },
  { name: "Qibla", path: "/qibla", short: "Qibla direction from anywhere.", description: "Find the Qibla direction to the Kaaba from anywhere." },
  { name: "Islamic Calendar", path: "/calendar", short: "Hijri and Gregorian dates.", description: "Hijri and Gregorian calendar with date conversion." },
  { name: "Quran Reciters", path: "/reciters", short: "Recitations by renowned qaris.", description: "Listen to Qur'an recitations by renowned qaris." },
  { name: "Ask", path: "/ask", short: "AI answers with Quran and Hadith references.", description: "AI-powered Islamic knowledge assistant: ask questions about Islam and get source-focused answers with references from the Quran, Tafsir and Hadith." }
];
export const SITE_SECTIONS = ALL_SECTIONS.filter((s) => ASK_ENABLED || s.path !== "/ask");


/** Plain-language answers about the site itself. Shown on the home and
 * About pages and mirrored in FAQPage structured data. */
export const SITE_FAQ = [
  {
    q: "What is Muslim99?",
    a: "Muslim99 (themuslim99.com) is an AI-powered Islamic knowledge and research platform founded by Hafiz Abdullah Qureshi — “One App. A World of Islamic Knowledge.” It brings together the complete Holy Quran with 130+ translations in 47 languages, 130+ tafsirs in 33 languages, 37+ hadith collections, 38+ Quran reciters, AI Islamic research, duas and azkar, prayer times, the Qibla direction and the Hijri calendar, with the source of every text shown."
  },
  {
    q: "Who founded Muslim99?",
    a: "Muslim99 was founded by Hafiz Abdullah Qureshi, who leads the vision and development of the platform with the goal of making authentic Islamic knowledge accessible worldwide through web, mobile and artificial intelligence technologies."
  },
  {
    q: "Does Muslim99 use AI?",
    a: "Yes. Muslim99 combines Islamic sources with AI-powered search and research: its Islamic knowledge assistant gives source-focused answers with references from the Quran, Tafsir and Hadith."
  },
  {
    q: "Is Muslim99 free?",
    a: "Yes. Everything on Muslim99 is free to read without an account. A free account adds bookmarks, favourites and reading progress that sync across devices."
  },
  {
    q: "Which hadith books are on Muslim99?",
    a: "Sahih Bukhari, Sahih Muslim, Sunan Abu Dawood, Jami at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Imam Malik, Musnad Ahmad, Mishkat al-Masabih, Riyad as-Salihin, Bulugh al-Maram, the 40 Hadith of an-Nawawi, Sahih Ibn Khuzaymah, Sahih Ibn Hibban, Al-Adab Al-Mufrad, Sunan Darimi, Sunan al-Daraqutni, Al-Mustadrak, Musannaf Abd al-Razzaq, Tabarani's Mu'jam al-Kabir and al-Awsat, Majma al-Zawaid and more — 37 collections with Arabic text, Urdu and English translations and gradings."
  },
  {
    q: "Which languages does Muslim99 support?",
    a: "Quran translations are available in 47 languages and tafsir in 33 languages, including Arabic, Urdu, English, Hindi, Bengali, Indonesian, Turkish, Persian and Russian; hadith are available in Arabic, Urdu and English."
  },
  {
    q: "What are the official Muslim99 platforms?",
    a: "The official website is themuslim99.com. The Muslim99 Android app is on Google Play (play.google.com/store/apps/details?id=com.muslim99) and the iPhone app is coming soon to the App Store. Muslim99 is also on Instagram (instagram.com/themuslim99_), Facebook (facebook.com/profile.php?id=61594990950125) and LinkedIn (linkedin.com/company/themuslim99)."
  }
];
