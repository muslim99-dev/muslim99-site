export const metadata = { title: "Tafsir — Muslim99" };

export default function TafsirPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-center">
      <div className="rounded-card border border-border bg-white p-10">
        <h1 className="text-xl font-semibold text-teal-dark">Tafsir library coming soon</h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Commentary from named, attributed sources (e.g. Ibn Kathir, Al-Jalalayn, Ma'ariful Qur'an) will appear here
          per ayah through the TafsirProvider interface once a source is connected. Tafsir is never merged across
          sources or fabricated.
        </p>
      </div>
    </div>
  );
}
