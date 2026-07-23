"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Languages, ScrollText, Grid2x2, Sprout, ArrowRight, BookOpen } from "lucide-react";
import Eyebrow from "./Eyebrow";

const PILLARS = [
  { icon: Languages, title: "Translations", sub: "Urdu, English & Hindi — many renowned translators side by side." },
  { icon: ScrollText, title: "Tafseer", sub: "Verse-by-verse commentary from Ibn Kaseer, Ahsan-ul-Bayan and more." },
  { icon: Grid2x2, title: "Word by word", sub: "Every Arabic word with its precise meaning to deepen understanding." },
  { icon: Sprout, title: "Root words", sub: "Trace each word to its Arabic root for study and reflection." },
];

export default function QuranIntro() {
  return (
    <section id="read-quran" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.12]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <Eyebrow>Now on the web</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]" style={{ color: "var(--text)" }}>
              Read the entire Quran, beautifully
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
              All 114 surahs with authentic Arabic text, word-by-word meaning, multiple
              translations, and tafseer from renowned scholars &mdash; searchable, filterable,
              and free for the whole ummah.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/quran"
                className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <BookOpen size={18} /> Explore the Quran
                <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-5 pl-1 text-[13px]" style={{ color: "var(--faint)" }}>
                <span>
                  <strong style={{ color: "var(--primary)" }}>114</strong> surahs
                </span>
                <span>
                  <strong style={{ color: "var(--primary)" }}>6,236</strong> verses
                </span>
              </div>
            </div>
          </div>

          {/* Right: pillar cards */}
          <div className="grid grid-cols-2 gap-4">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                  className="card-surface p-5"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ background: "var(--soft)", color: "var(--primary)" }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-semibold" style={{ color: "var(--text)" }}>
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {p.sub}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
