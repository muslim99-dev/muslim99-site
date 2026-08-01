import { gradeTone } from "@/lib/hadith";

const TONE_STYLES: Record<ReturnType<typeof gradeTone>, { bg: string; fg: string }> = {
  sahih: { bg: "var(--soft)", fg: "var(--primary)" },
  hasan: { bg: "var(--gold-soft)", fg: "var(--gold)" },
  daif: { bg: "rgba(217, 77, 77, 0.12)", fg: "#c24a4a" },
  neutral: { bg: "var(--card-2)", fg: "var(--muted)" },
};

export default function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null;
  const tone = gradeTone(grade);
  const style = TONE_STYLES[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: style.bg, color: style.fg }}
    >
      {grade}
    </span>
  );
}
