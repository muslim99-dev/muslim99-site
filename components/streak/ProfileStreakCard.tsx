"use client";

import { StreakPanel, useStreak } from "./StreakProvider";

/** Streak details on the profile page. */
export default function ProfileStreakCard() {
  const { streak } = useStreak();
  return (
    <section className="rounded-card border border-border bg-white p-5">
      <h2 className="font-medium text-teal-dark">Daily streak</h2>
      <p className="mt-1 text-sm text-muted">
        Open Muslim99 every day to grow your streak. Miss a day and it breaks — you get 5 restore credits each month (one credit per missed day).
      </p>
      <div className="mt-4 sm:max-w-sm">{streak ? <StreakPanel s={streak} /> : <p className="text-sm text-muted">Loading your streak…</p>}</div>
    </section>
  );
}
