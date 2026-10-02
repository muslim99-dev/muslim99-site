import SavedHadithView from "@/components/hadith/SavedHadithView";
import { Breadcrumbs, PageHero } from "@/components/hadith/HadithUI";

export const metadata = { title: "My Hadith — Muslim99" };

export default function SavedHadithPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Hadith", href: "/hadith" }, { label: "My Hadith" }]} />
      <div className="mt-4">
        <PageHero
          eyebrow="Your library"
          title="My Hadith"
          subtitle="Pick up where you left off, and keep the hadith you bookmark or love in one place."
          arabic="المحفوظات"
        />
      </div>
      <div className="mt-8">
        <SavedHadithView />
      </div>
    </div>
  );
}
