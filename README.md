# Muslim99 — Marketing Website

A fully responsive Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion marketing site for the **Muslim99** Islamic companion app, built from the app's own design tokens (teal `#269398` primary, Outfit + Amiri type system) with a light/dark theme switch (light by default).

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run build      # production build
npm run start       # serve the production build
```

## What's inside

- **Theme system** — `src/components/ThemeProvider.tsx` + `src/app/globals.css` reproduce the app's exact light/dark CSS variables (background, card, primary, gold accent, shadows, radii). Defaults to light on first visit; an inline script in `layout.tsx` prevents any flash on reload; the choice is remembered in `localStorage`.
- **Sections** — `Navbar`, `Hero`, `Features`, `VerseShowcase` (Quran + Hadith of the day), `ScreensGallery` (real app screenshots in a phone frame), `Stats`, `Testimonials`, `DownloadCTA`, `Footer` — all in `src/components/`.
- **Content** — ported from the app prototype's `data.jsx` into `src/lib/data.ts` (prayer times, verse/hadith of the day, Hadith collections, stats, feature copy, testimonials).
- **Brand assets** — the Quran app icon you supplied is used as the wordmark, browser favicon, Apple touch icon and PWA manifest icons (`public/logo/`, `src/app/favicon.ico`, `public/site.webmanifest`).
- **Screenshots** — the six app screenshots you supplied (`public/shots/`) power the hero and the "Inside the app" gallery, framed with a custom CSS phone bezel (`PhoneFrame.tsx`).
- **Fonts** — self-hosted via `@fontsource/outfit` and `@fontsource/amiri` (no runtime dependency on Google Fonts), matching the app's `Outfit` + `Amiri` pairing.
- **Motion** — Framer Motion page-load reveals, scroll-triggered reveals, a floating dual-phone hero, an animated stats counter and a spring-driven theme toggle. Reduced-motion is respected globally.

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · lucide-react
