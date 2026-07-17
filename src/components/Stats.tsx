"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { STATS } from "@/lib/data";

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>{display.toLocaleString("en-US")}</span>
  );
}

export default function Stats() {
  return (
    <section className="relative py-20" style={{ background: "var(--grad-hero)" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--primary-ink)" }}>
              <Counter value={s.value} />
              {s.suffix}
            </p>
            <p className="mt-2 text-[13.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
