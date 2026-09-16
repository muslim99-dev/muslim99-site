import Image from "next/image";
import Link from "next/link";
import DailyAyah from "@/components/DailyAyah";

const features = [
  { title: "Quran", desc: "Full mushaf with translation, word-by-word, and tafsir side by side.", href: "/quran" },
  { title: "Hadith", desc: "Search sourced collections with narrator, grading, and reference.", href: "/hadith" },
  { title: "Tafsir", desc: "Compare commentary from multiple attributed sources per ayah.", href: "/tafsir" },
  { title: "Quran Audio", desc: "Verse-by-verse recitation from a library of reciters.", href: "/reciters" },
  { title: "Prayer Times", desc: "Accurate timings with Hanafi or Shafi'i Asr calculation.", href: "/prayer-times" },
  { title: "Qibla", desc: "A calibrated compass pointing to the Kaaba from anywhere.", href: "/qibla" },
  { title: "Islamic Calendar", desc: "Hijri and Gregorian dates, converted both ways.", href: "/calendar" },
  { title: "Duas & Azkar", desc: "Everyday supplications organized by occasion.", href: "/duas" }
];

const reciters = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", country: "Kuwait" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", country: "Egypt" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit", country: "Egypt" },
  { id: "ar.sudais", name: "Abdur-Rahman As-Sudais", country: "Saudi Arabia" }
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aqua/70 to-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-14 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Image src="/logo.png" alt="Muslim99" width={56} height={56} className="rounded-2xl" />
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold leading-[1.1] text-teal-dark">
              Your Complete Islamic Companion
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-muted max-w-lg">
              Read the Quran, listen to beautiful recitations, explore Hadith and Tafsir, find prayer times, locate
              the Qibla, and build a daily connection with your Deen — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quran" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-deep transition-colors">
                Read Quran
              </Link>
              <Link href="/quran" className="rounded-full border border-border bg-white px-6 py-3 text-sm font-medium text-teal-dark hover:border-primary transition-colors">
                Explore Muslim99
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["Quran", "Hadith", "Tafsir", "Prayer", "Qibla", "Hijri Calendar"].map((f) => (
              <div key={f} className="rounded-card border border-border bg-white/80 backdrop-blur p-5 shadow-card">
                <p className="text-sm font-medium text-teal-dark">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY AYAH */}
      <section className="mx-auto max-w-3xl px-5 lg:px-8 -mt-10 relative z-10">
        <DailyAyah />
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Everything for your daily practice</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-card border border-border bg-white p-6 hover:shadow-card hover:-translate-y-0.5 transition-all"
            >
              <p className="font-medium text-teal-dark">{f.title}</p>
              <p className="mt-2 text-sm text-muted leading-relaxed">{f.desc}</p>
              <span className="mt-4 inline-block text-sm text-primary-deep opacity-0 group-hover:opacity-100 transition-opacity">
                Open
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* QURAN SECTION */}
      <section className="bg-white border-y border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Read. Listen. Understand.</h2>
            <p className="mt-4 text-muted leading-relaxed max-w-md">
              A Quran reader with the Uthmani script, aligned translation, word-by-word breakdowns, tafsir, and
              synchronized audio — sourced live so nothing is ever guessed.
            </p>
            <Link href="/quran" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-deep transition-colors">
              Open Quran
            </Link>
          </div>
          <div className="rounded-card border border-border bg-aqua/40 p-8">
            <p dir="rtl" className="font-quran text-3xl text-teal-dark text-right">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="mt-4 text-sm text-muted">In the name of Allah, the Entirely Merciful, the Especially Merciful.</p>
          </div>
        </div>
      </section>

      {/* AUDIO / RECITERS */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Listen to the Quran, ayah by ayah</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reciters.map((r) => (
            <div key={r.id} className="rounded-card border border-border bg-white p-6">
              <div className="h-11 w-11 rounded-full bg-aqua grid place-items-center text-primary-deep font-medium">
                {r.name.charAt(0)}
              </div>
              <p className="mt-4 font-medium text-teal-dark text-sm">{r.name}</p>
              <p className="text-xs text-muted mt-1">{r.country} · 114 Surahs</p>
            </div>
          ))}
        </div>
        <Link href="/reciters" className="mt-6 inline-block text-sm text-primary-deep">
          View all reciters →
        </Link>
      </section>

      {/* FINAL CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Make Muslim99 part of your daily journey.</h2>
          <div className="mt-7 flex justify-center gap-3 flex-wrap">
            <Link href="/quran" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-deep transition-colors">
              Start Reading
            </Link>
            <Link href="/prayer-times" className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
