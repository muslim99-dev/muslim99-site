import { redirect } from "next/navigation";
import { ASK_ENABLED } from "@/lib/site";

export const metadata = {
  title: { absolute: "Ask About Islam — Answers from the Qur'an and Hadith | Muslim99" },
  description: "Ask questions about Islam and get answers grounded in the Qur'an, tafsir and hadith, with the references cited.",
  alternates: { canonical: "/ask" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Hidden for now — see ASK_ENABLED in lib/site.ts.
  if (!ASK_ENABLED) redirect("/");
  return children;
}
