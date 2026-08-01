"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollText, Languages, Search, Bookmark, ArrowRight, BookOpen } from "lucide-react";
import Eyebrow from "./Eyebrow";

const PILLARS = [
  { icon: BookOpen, title: "The Six Books", sub: "Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai and Ibn Majah, in full." },
  { icon: Languages, title: "8 languages", sub: "Arabic, English, Urdu, Bengali, French, Indonesian, Russian and Turkish." },
  { icon: Search, title: "Instant search", sub: "Find a hadith by text, narrator, chapter, or reference in a click." },
  { icon: Bookmark, title: "Bookmarks & progress", sub: "Save a hadith or pick up exactly where you left off." },
];

export default function HadithIntro() {
  return (
    <section id="hadith" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.12]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: pillar cards */}
          <div className="order-2 grid grid-cols-2 gap-4 lg:order-1">
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

          {/* Right: copy */}
          <div className="order-1 lg:order-2">
            <Eyebrow>The Prophetic tradition</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]" style={{ color: "var(--text)" }}>
              The Hadith collection, beautifully organized
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
              All six major hadith collections — book, chapter, and hadith, with narrator, grading, and
              reference for every one — searchable instantly, in eight languages.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/hadith"
                className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <ScrollText size={18} /> Explore the Hadith collection
                <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-5 pl-1 text-[13px]" style={{ color: "var(--faint)" }}>
                <span>
                  <strong style={{ color: "var(--primary)" }}>6</strong> books
                </span>
                <span>
                  <strong style={{ color: "var(--primary)" }}>34,532</strong> hadiths
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
