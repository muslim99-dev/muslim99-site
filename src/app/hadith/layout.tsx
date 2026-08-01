import { HadithPreferencesProvider } from "@/components/hadith/HadithPreferencesProvider";
import GlobalHadithSearch from "@/components/hadith/GlobalHadithSearch";

export default function HadithLayout({ children }: { children: React.ReactNode }) {
  return (
    <HadithPreferencesProvider>
      {children}
      <GlobalHadithSearch />
    </HadithPreferencesProvider>
  );
}
