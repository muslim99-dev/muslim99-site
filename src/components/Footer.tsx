import Logo from "./Logo";
import { Send, AtSign, MessageCircle } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: ["Prayer Times", "Quran", "Hadith", "Qibla Compass"],
  },
  {
    title: "Company",
    links: ["About", "Support", "Privacy Policy", "Terms"],
  },
];

export default function Footer() {
  return (
    <footer className="relative pt-20" style={{ background: "var(--card-2)", borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={38} />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
              A quiet, well-made Islamic companion for prayer, Quran, Hadith
              and Qibla &mdash; free for the entire ummah.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[AtSign, Send, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ background: "var(--soft)", color: "var(--primary)" }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "var(--text)" }}>
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[14px] transition-colors hover:opacity-100"
                      style={{ color: "var(--muted)" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 flex flex-col items-center justify-between gap-3 pt-6 text-[13px] sm:flex-row"
          style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
        >
          <p>&copy; {new Date().getFullYear()} Muslim99. All rights reserved.</p>
          <p dir="rtl" className="font-arabic text-[14px]" style={{ color: "var(--soft-text)" }}>
            جَزَاكَ اللَّهُ خَيْرًا
          </p>
        </div>
      </div>
    </footer>
  );
}
