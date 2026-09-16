export const metadata = { title: "Hadith — Muslim99" };

export default function HadithPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-center">
      <div className="rounded-card border border-border bg-white p-10">
        <h1 className="text-xl font-semibold text-teal-dark">Hadith library coming soon</h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          To keep every Hadith accurately sourced — with correct narrator, grading, and reference — this section
          connects to a licensed collection (e.g. Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud) through the
          HadithProvider interface once credentials for that source are configured. Nothing is generated or
          approximated in the meantime.
        </p>
      </div>
    </div>
  );
}
