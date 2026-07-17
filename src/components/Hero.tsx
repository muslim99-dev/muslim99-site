"use client";

import { motion } from "framer-motion";
import { Apple, PlayCircle, Star } from "lucide-react";
import Eyebrow from "./Eyebrow";
import PhoneFrame from "./PhoneFrame";
import { HIJRI } from "@/lib/data";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      {/* ambient teal glow + geometric lattice — the section's signature backdrop */}
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.35]" />
      <div
        className="pointer-events-none absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "var(--soft)" }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Eyebrow>{`${HIJRI.day} ${HIJRI.month} ${HIJRI.year} AH \u00b7 Trusted by worshippers worldwide`}</Eyebrow>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 text-[2.6rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl"
            style={{ color: "var(--text)" }}
          >
            Five daily prayers,
            <br />
            one calm companion.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-md text-[17px] leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Muslim99 gathers accurate prayer times, the full Quran, six
            authentic Hadith collections and a live Qibla compass into a
            single, beautifully quiet app &mdash; built to move with your day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#download"
              className="btn-primary inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Apple size={18} /> App Store
            </a>
            <a
              href="#download"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{
                borderRadius: "var(--r-btn)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                background: "var(--card)",
              }}
            >
              <PlayCircle size={18} /> Google Play
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="mt-9 flex items-center gap-4"
          >
            <div className="flex -space-x-1" style={{ color: "var(--gold)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-[14px]" style={{ color: "var(--muted)" }}>
              4.9 average &middot; loved by 120,000+ worshippers
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto flex w-full max-w-md items-center justify-center"
        >
          <div
            className="absolute h-[26rem] w-[26rem] rounded-full blur-3xl"
            style={{ background: "var(--soft)" }}
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 -rotate-3"
          >
            <PhoneFrame src="/shots/home.png" alt="Muslim99 home screen, light theme" width={230} priority />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="relative z-20 -ml-16 mt-24 rotate-6"
          >
            <PhoneFrame src="/shots/dark-glossy.png" alt="Muslim99 home screen, dark theme" width={190} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
