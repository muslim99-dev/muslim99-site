// src/lib/data.ts — content ported from the Muslim99 app prototype (data.jsx)

export const PRAYERS = [
  { key: "fajr", name: "Fajr", arabic: "الفجر", time: "4:52", meridiem: "AM" },
  { key: "dhuhr", name: "Dhuhr", arabic: "الظهر", time: "1:07", meridiem: "PM" },
  { key: "asr", name: "Asr", arabic: "العصر", time: "4:46", meridiem: "PM" },
  { key: "maghrib", name: "Maghrib", arabic: "المغرب", time: "7:56", meridiem: "PM" },
  { key: "isha", name: "Isha", arabic: "العشاء", time: "9:22", meridiem: "PM" },
] as const;

export const VERSE_OF_DAY = {
  surah: "Ar-Ra\u02bbd",
  ref: "13:28",
  ar: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
  en: "Those who believe and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest.",
};

export const HADITH_OF_DAY = {
  collection: "Sahih al-Bukhari",
  ref: "Book 1, Hadith 1",
  grade: "Sahih",
  narrator: "Umar ibn al-Khattab \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647",
  ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
  en: "Actions are judged only by intentions, and every person will be rewarded according to what he intended.",
};

export const HADITH_COLLECTIONS = [
  { name: "Sahih al-Bukhari", ar: "صحيح البخاري", books: 97, hadiths: "7,563" },
  { name: "Sahih Muslim", ar: "صحيح مسلم", books: 56, hadiths: "7,470" },
  { name: "Sunan Abu Dawud", ar: "سنن أبي داود", books: 43, hadiths: "5,274" },
  { name: "Jami\u02bb at-Tirmidhi", ar: "جامع الترمذي", books: 49, hadiths: "3,956" },
  { name: "Sunan an-Nasa\u02bbi", ar: "سنن النسائي", books: 51, hadiths: "5,761" },
  { name: "Riyad as-Salihin", ar: "رياض الصالحين", books: 19, hadiths: "1,896" },
] as const;

export const SURAH_COUNT = 114;

export const STATS = [
  { value: 114, suffix: "", label: "Surahs, fully indexed" },
  { value: 33000, suffix: "+", label: "Authentic hadiths" },
  { value: 5, suffix: "", label: "Daily prayers tracked" },
  { value: 1, suffix: "M+", label: "Duas & remembrances" },
] as const;

export const FEATURES = [
  {
    icon: "mosque",
    title: "Prayer Times",
    sub: "Accurate Fajr to Isha timings for your exact location, with Athan alerts.",
  },
  {
    icon: "quran",
    title: "The Noble Quran",
    sub: "Full Arabic mushaf with translation, transliteration and verse-by-verse audio.",
  },
  {
    icon: "hadith",
    title: "Hadith Library",
    sub: "Six authentic collections including Bukhari and Muslim, searchable in seconds.",
  },
  {
    icon: "compass",
    title: "Qibla Compass",
    sub: "Live compass pointing to the Kaaba, calibrated wherever you travel.",
  },
  {
    icon: "calendar",
    title: "Hijri Calendar",
    sub: "Islamic dates, sacred months and holidays synced with your Gregorian calendar.",
  },
  {
    icon: "moon",
    title: "Light & Dark",
    sub: "A calm reading surface by day, a glare-free glow for late-night reflection.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Aisha R.",
    role: "Toronto, Canada",
    quote:
      "The prayer reminders changed my routine completely. It feels like the app was designed by someone who actually prays five times a day.",
  },
  {
    name: "Bilal K.",
    role: "Lahore, Pakistan",
    quote:
      "I switched from three different apps to just this one. The Quran reader alone is worth it \u2014 clean, fast, and the Arabic renders beautifully.",
  },
  {
    name: "Sumayyah N.",
    role: "London, UK",
    quote:
      "Qibla compass has never been this accurate for me while travelling. And the dark mode is genuinely easy on the eyes at night.",
  },
] as const;

export const HIJRI = { day: 19, month: "Dhul-Qa\u02bbdah", year: 1447 };
