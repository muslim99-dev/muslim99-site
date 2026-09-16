import type { Metadata } from "next";
import { Inter, Amiri, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-arabic" });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-urdu" });

export const metadata: Metadata = {
  title: "Muslim99 — Your Complete Islamic Companion",
  description:
    "Read the Quran, listen to beautiful recitations, explore Hadith and Tafsir, find prayer times, locate the Qibla, and build a daily connection with your Deen — all in one place.",
  metadataBase: undefined
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable} ${nastaliq.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </SessionProvider>
      </body>
    </html>
  );
}
