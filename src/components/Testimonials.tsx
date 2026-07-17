"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { TESTIMONIALS } from "@/lib/data";

export default function Testimonials() {
  return (
    <section id="reviews" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>What worshippers say</Eyebrow>
          <h2
            className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]"
            style={{ color: "var(--text)" }}
          >
            Built around a real daily rhythm
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-surface flex flex-col p-7"
            >
              <Quote size={22} style={{ color: "var(--gold)" }} />
              <p className="mt-4 flex-1 text-[15px] leading-relaxed" style={{ color: "var(--text)" }}>
                {t.quote}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
                    {t.name}
                  </p>
                  <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                    {t.role}
                  </p>
                </div>
                <div className="flex" style={{ color: "var(--gold)" }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
