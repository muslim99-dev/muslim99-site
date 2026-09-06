"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { SITE_CONFIG } from "@/constants/site";

const LINKS = [
  { href: "/quran", label: "Read Quran" },
  { href: "/hadith", label: "Read Hadith" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/about", label: "About" },
];

// The one navbar for the whole site — homepage, Quran, and Hadith pages all
// render this same component instead of each having its own header, so the
// logo, main nav, and theme toggle stay identical everywhere. `backHref`
// adds a back arrow for deep pages (a surah, a hadith book/chapter); `extra`
// is a slot for the one page-specific control a section needs (the Qari
// selector on Quran reading pages, the language switcher on Hadith pages).
export default function Navbar({
  backHref,
  backLabel,
  extra,
}: {
  backHref?: string;
  backLabel?: string;
  extra?: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className="mx-auto mt-3 flex max-w-[1200px] items-center justify-between gap-4 rounded-2xl px-4 py-2.5 backdrop-blur-xl transition-all duration-300 sm:mt-4 sm:px-6"
        style={{
          background: "var(--tab-bg, var(--card))",
          border: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div className="flex shrink-0 items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label={backLabel ?? "Back"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{ background: "var(--soft)", color: "var(--primary)" }}
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <Link href="/" className="flex items-center">
            <Logo size={34} />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors hover:opacity-100"
              style={{ color: "var(--muted)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {extra}
          <ThemeToggle />
          <a
            href={SITE_CONFIG.links.playStore}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-4 py-2 text-[14px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Get the app
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {extra}
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--soft)", color: "var(--primary)" }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mt-2 rounded-2xl p-3 backdrop-blur-xl md:hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-[15px] font-medium"
              style={{ color: "var(--text)" }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={SITE_CONFIG.links.playStore}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-primary mt-1 block px-4 py-3 text-center text-[15px] font-semibold"
          >
            Get the app
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
