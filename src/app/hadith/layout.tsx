import { HadithPreferencesProvider } from "@/components/hadith/HadithPreferencesProvider";

export default function HadithLayout({ children }: { children: React.ReactNode }) {
  return <HadithPreferencesProvider>{children}</HadithPreferencesProvider>;
}
