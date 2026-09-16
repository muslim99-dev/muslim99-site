import { getAyah } from "@/lib/quranApi";

function dayOfYearAyahRef(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const globalAyah = (dayOfYear % 6236) + 1;
  return String(globalAyah);
}

export default async function DailyAyah() {
  let ayah;
  try {
    ayah = await getAyah(dayOfYearAyahRef());
  } catch {
    ayah = null;
  }

  return (
    <div className="rounded-card border border-border bg-white shadow-card p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-deep">Daily Ayah</p>
        {ayah && (
          <p className="text-xs text-muted">
            {ayah.surah.englishName} {ayah.surah.number}:{ayah.numberInSurah}
          </p>
        )}
      </div>

      {ayah ? (
        <>
          <p dir="rtl" className="font-quran text-2xl sm:text-3xl text-teal-dark mt-5">
            {ayah.arabic}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{ayah.translation}</p>
        </>
      ) : (
        <p className="mt-5 text-sm text-muted">Unable to reach the Quran source right now — please try again shortly.</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button className="grid h-9 w-9 place-items-center rounded-full bg-aqua text-primary-deep">
          <PlayIcon />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted">
          <BookmarkIcon />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted">
          <ShareIcon />
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3.5h12v17l-6-4-6 4v-17Z" strokeLinejoin="round" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="18" cy="5" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="19" r="2.3" />
      <path d="M8 10.8 16 6.4M8 13.2l8 4.4" />
    </svg>
  );
}
