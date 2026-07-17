"use client";

import { motion } from "framer-motion";
import { BookOpen, ScrollText } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { VERSE_OF_DAY, HADITH_OF_DAY, HADITH_COLLECTIONS } from "@/lib/data";

export default function VerseShowcase() {
  return (
    <section id="quran" className="relative py-24 sm:py-32" style={{ background: "var(--card-2)" }}>
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.18]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Read, reflect, remember</Eyebrow>
          <h2
            className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]"
            style={{ color: "var(--text)" }}
          >
            The Quran and Sunnah, close at hand
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="card-surface flex flex-col p-8 sm:p-10"
          >
            <div className="flex items-center gap-2.5" style={{ color: "var(--primary)" }}>
              <BookOpen size={20} />
              <span className="text-[13px] font-semibold uppercase tracking-wider">Verse of the day</span>
            </div>
            <p dir="rtl" className="font-arabic mt-7 text-[26px] leading-[1.9]" style={{ color: "var(--text)" }}>
              {VERSE_OF_DAY.ar}
            </p>
            <p className="mt-6 text-[15.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              &ldquo;{VERSE_OF_DAY.en}&rdquo;
            </p>
            <p className="mt-6 text-[13.5px] font-semibold" style={{ color: "var(--soft-text)" }}>
              S\u016brah {VERSE_OF_DAY.surah} &middot; {VERSE_OF_DAY.ref}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="card-surface flex flex-col p-8 sm:p-10"
          >
            <div className="flex items-center gap-2.5" style={{ color: "var(--primary)" }}>
              <ScrollText size={20} />
              <span className="text-[13px] font-semibold uppercase tracking-wider">Hadith of the day</span>
            </div>
            <p dir="rtl" className="font-arabic mt-7 text-[24px] leading-[1.9]" style={{ color: "var(--text)" }}>
              {HADITH_OF_DAY.ar}
            </p>
            <p className="mt-6 text-[15.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              &ldquo;{HADITH_OF_DAY.en}&rdquo;
            </p>
            <p className="mt-6 text-[13.5px] font-semibold" style={{ color: "var(--soft-text)" }}>
              {HADITH_OF_DAY.collection} &middot; {HADITH_OF_DAY.ref} &middot; {HADITH_OF_DAY.grade}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {HADITH_COLLECTIONS.map((c) => (
            <div key={c.name} className="card-surface p-4 text-center">
              <p dir="rtl" className="font-arabic text-[15px]" style={{ color: "var(--text)" }}>
                {c.ar}
              </p>
              <p className="mt-1 truncate text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                {c.name}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--soft-text)" }}>
                {c.hadiths} hadiths
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
