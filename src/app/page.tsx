import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import VerseShowcase from "@/components/VerseShowcase";
import PrayerTimes from "@/components/PrayerTimes";
import ScreensGallery from "@/components/ScreensGallery";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import DownloadCTA from "@/components/DownloadCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <VerseShowcase />
        <PrayerTimes />
        <ScreensGallery />
        <Stats />
        <Testimonials />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
