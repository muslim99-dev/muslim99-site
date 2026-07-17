"use client";

import { motion } from "framer-motion";
import { Apple, PlayCircle } from "lucide-react";
import PhoneFrame from "./PhoneFrame";

export default function DownloadCTA() {
  return (
    <section id="download" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.3]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "var(--soft)" }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1fr_0.7fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <h2
            className="text-3xl font-semibold leading-tight tracking-tight sm:text-[2.6rem]"
            style={{ color: "var(--text)" }}
          >
            Carry your deen in your pocket, wherever you are.
          </h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Free to download. No ads, no distractions &mdash; just prayer
            times, Quran, Hadith and Qibla, ready the moment you open it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="btn-primary inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Apple size={18} /> Download for iOS
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{
                borderRadius: "var(--r-btn)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                background: "var(--card)",
              }}
            >
              <PlayCircle size={18} /> Download for Android
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <PhoneFrame src="/shots/dark-blue-home.png" alt="Muslim99 app preview" width={220} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
