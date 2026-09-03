import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import VerseHadithOfTheDay from "@/components/VerseHadithOfTheDay";
import QuranIntro from "@/components/QuranIntro";
import HadithIntro from "@/components/HadithIntro";
import PrayerTimes from "@/components/PrayerTimes";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <VerseHadithOfTheDay />
        <QuranIntro />
        <HadithIntro />
        <PrayerTimes />
        <Stats />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
