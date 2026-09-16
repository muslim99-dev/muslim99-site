# Muslim99 — Next.js starter

A working Next.js 14 (App Router + TypeScript + Tailwind) build of the Muslim99 brand and core Quran/prayer
experience described in the build brief. This is a real, buildable app — not a mockup — scoped to what can be
built accurately without a licensed content backend or database.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` produces a production build (verified in this sandbox; requires
normal internet access for Google Fonts, which this sandbox's network doesn't allow).

## What's implemented and working

- **Brand & design system** — colors, type scale, card/border/shadow tokens, light/dark/sepia CSS themes, exactly
  per the brief's palette (`#18A5A8` primary, gold used sparingly, etc.), using the uploaded logo throughout.
- **Landing page** — hero, daily ayah, feature grid, Quran preview, reciters preview, final CTA, footer.
- **`/quran`** — all 114 surahs with Makki/Madani filter and search, fetched live from the Quran API (never
  hardcoded).
- **`/quran/[surah]`** — full reader: Arabic (Uthmani script) + translation toggle, adjustable font size,
  per-ayah play/bookmark/copy, sequential audio playback with autoplay and highlight-while-playing.
- **`/prayer-times`** — geolocation (with manual-city fallback), Hanafi/Shafi'i Asr toggle, 5 calculation methods,
  live countdown to next prayer.
- **`/qibla`** — real great-circle bearing + distance to the Kaaba, animated compass, optional device-orientation
  calibration (with the iOS permission prompt handled).
- **`/calendar`** — live Hijri/Gregorian today, and conversion both directions.
- **`/duas`** — a handful of Qur'anic duas, pulled live by exact surah:ayah reference (so nothing is invented).
- **`/reciters`** — reciter directory.
- Mobile bottom nav, sticky/responsive layout, empty-state and error-state patterns per the brief.

## Why some sections are stubbed, not built

The brief's content-accuracy rule (§65: "never invent Quran, Hadith, Tafsir, translations, or rulings") is taken
literally here. Two sections are intentionally left as clearly-labeled "coming soon" states rather than filled
with placeholder text:

- **`/hadith`, `/tafsir`** — these need a *licensed* dataset (e.g. a Hadith API with narrator/grading metadata, a
  named Tafsir corpus) with real attribution. Wiring up a free/unverified source risked either wrong content or
  silent misattribution, so the page explains what's missing instead.

## Backend (new)

- **Database**: Postgres on Neon, managed with Prisma (`prisma/schema.prisma`). Connection string lives in
  `.env` / `.env.local` (both git-ignored) as `DATABASE_URL` — never commit it or expose it to client code.
- **Auth**: NextAuth (JWT sessions) with an email/password Credentials provider. Passwords are hashed with
  bcrypt. Guest mode still works everywhere — signing in is only required for anything that persists per-user.
  Routes: `/auth/signin`, `/auth/signup`, `/profile`.
- **Persisted per-user data**: Bookmarks (`/api/bookmarks`, wired into the Quran reader's bookmark button and
  the `/bookmarks` page), Notes (`/api/notes`), Reading progress (`/api/progress`), Khatmah tracking
  (`/api/khatmah`, powering the `/khatmah` page with a 604-page target, daily target, and progress ring).
- To add a Google OAuth option later: add a `GoogleProvider` to `lib/auth.ts` and set
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env.local`.
- After changing `prisma/schema.prisma`, run `npx prisma db push` (or `migrate dev` once you want tracked
  migrations) to sync Neon, then `npx prisma generate`.

## Architecture notes for extending this

- `lib/quranApi.ts` is the one place that talks to the Quran source (currently `alquran.cloud` for text/editions,
  `islamic.network` for audio). Swapping providers means editing this file only — matches the brief's
  `QuranProvider` abstraction (§41).
- Prayer times and the Hijri calendar use the Aladhan API directly from client components; wrap them the same
  way if you add a `PrayerProvider`/`CalendarProvider` later.
- **Still not built** (needs further work, some of it requiring a licensed content pipeline): reading streaks,
  notifications, admin CMS, word-by-word morphology (needs a specialized corpus like corpus.quran.com, not a
  generic translation API), the AI "Follow My Recitation" voice-tracking feature, PWA/offline caching, and full
  multi-language UI beyond the Quran translation picker, and real Hadith/Tafsir content (still needs a
  licensed/attributed source — see the "Backend" section above for what now has a database and auth). The route
  structure and provider-interface pattern above are laid out so each of these can be added independently.
