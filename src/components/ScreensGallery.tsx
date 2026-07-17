"use client";

import { motion } from "framer-motion";
import Eyebrow from "./Eyebrow";
import PhoneFrame from "./PhoneFrame";

const SHOTS = [
  { src: "/shots/home.png", alt: "Home screen — light theme", label: "Light theme" },
  { src: "/shots/dark-blue-home.png", alt: "Home screen — dark theme", label: "Dark theme" },
  { src: "/shots/dark-home-glossy.png", alt: "Home screen — glossy dark", label: "Next prayer" },
  { src: "/shots/dark-glossy.png", alt: "Prayer overview", label: "Prayer strip" },
  { src: "/shots/dark-blue-settings.png", alt: "Settings screen", label: "Settings" },
  { src: "/shots/dark-settings2.png", alt: "Appearance settings", label: "Appearance" },
];

export default function ScreensGallery() {
  return (
    <section id="screens" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Inside the app</Eyebrow>
          <h2
            className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]"
            style={{ color: "var(--text)" }}
          >
            Made for both day and night
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Switch instantly between a bright, paper-like light theme and a
            deep teal dark theme &mdash; your eyes decide, any time of day.
          </p>
        </div>
      </div>

      <div className="mt-16 overflow-x-auto scrollbar-none">
        <div className="flex w-max gap-6 px-6 sm:px-[calc((100vw-72rem)/2+1.5rem)]">
          {SHOTS.map((s, i) => (
            <motion.div
              key={s.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="flex flex-col items-center gap-4"
            >
              <PhoneFrame src={s.src} alt={s.alt} width={210} />
              <span
                className="rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ background: "var(--soft)", color: "var(--soft-text)" }}
              >
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
