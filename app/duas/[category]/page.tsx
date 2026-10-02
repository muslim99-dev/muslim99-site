import Link from "next/link";
import { notFound } from "next/navigation";
import { getDuaCategories, getDuaCategory } from "@/lib/duas";
import { Breadcrumbs, HeroStat, PageHero } from "@/components/hadith/HadithUI";
import DuaCategoryView from "@/components/duas/DuaCategoryView";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDuaCategories().map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const c = getDuaCategory(params.category);
  return { title: c ? `${c.title} — Duas — Muslim99` : "Duas — Muslim99" };
}

export default function DuaCategoryPage({ params }: { params: { category: string } }) {
  const category = getDuaCategory(params.category);
  if (!category) notFound();
  const all = getDuaCategories();
  const index = all.findIndex((c) => c.slug === category.slug);
  const next = all[index + 1];

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Duas", href: "/duas" }, { label: category.title }]} />

      <div className="mt-4">
        <PageHero
          eyebrow={category.source === "quran" ? "The Holy Qur'an" : "Hisn al-Muslim"}
          title={category.title}
          arabic={category.titleArabic}
        >
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <HeroStat value={category.total} label="Duas" />
            <HeroStat value={category.chapters.length} label={category.source === "quran" ? "Themes" : "Chapters"} />
          </div>
        </PageHero>
      </div>

      <div className="mt-8">
        <DuaCategoryView chapters={category.chapters} />
      </div>

      {next && (
        <div className="mt-12 flex justify-end">
          <Link
            href={`/duas/${next.slug}`}
            className="group rounded-card border border-border bg-white p-4 text-right transition-all hover:border-primary/40 hover:shadow-card sm:min-w-[320px]"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Next category →</p>
            <p className="mt-1 text-sm font-medium text-teal-dark group-hover:text-primary-deep">{next.title}</p>
          </Link>
        </div>
      )}
    </div>
  );
}
