"use client";

import { motion } from "framer-motion";
import { BookOpen, Compass, MoonStar, CalendarDays, Landmark, ScrollText, LucideIcon } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { FEATURES } from "@/lib/data";

const ICONS: Record<string, LucideIcon> = {
  mosque: Landmark,
  quran: BookOpen,
  hadith: ScrollText,
  compass: Compass,
  calendar: CalendarDays,
  moon: MoonStar,
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Everything for your five daily prayers</Eyebrow>
          <h2
            className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]"
            style={{ color: "var(--text)" }}
          >
            One app, every act of worship
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
            No clutter, no ads between you and your deen &mdash; just the
            tools you reach for every single day, designed with care.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[f.icon] ?? BookOpen;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="card-surface group p-7 transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-[18px] font-semibold" style={{ color: "var(--text)" }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {f.sub}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
