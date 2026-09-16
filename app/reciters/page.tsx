export const metadata = { title: "Reciters — Muslim99" };

const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", country: "Kuwait" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", country: "Egypt" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)", country: "Egypt" },
  { id: "ar.minshawi", name: "Muhammad Siddiq Al-Minshawi", country: "Egypt" },
  { id: "ar.sudais", name: "Abdur-Rahman As-Sudais", country: "Saudi Arabia" },
  { id: "ar.shaatree", name: "Abu Bakr Al-Shaatree", country: "Saudi Arabia" }
];

export default function RecitersPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Reciters</h1>
      <p className="mt-2 text-sm text-muted">
        Choose a default reciter for verse-by-verse audio. Recordings are served from the Islamic Network audio CDN
        with the reciter's name shown on every play.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {RECITERS.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-card border border-border bg-white p-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-aqua text-primary-deep font-medium">
              {r.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-teal-dark text-sm">{r.name}</p>
              <p className="text-xs text-muted mt-0.5">{r.country} · 114 Surahs</p>
            </div>
            <button className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:border-primary hover:text-primary-deep">
              Set default
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
