import { QariProvider } from "@/components/quran/QariProvider";

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  return <QariProvider>{children}</QariProvider>;
}
