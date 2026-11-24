"use client";

import Link from "next/link";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useStatisticsStore } from "@/store/statistics-store";

export function AchievementsList() {
  const unlocked = useStatisticsStore((state) => state.achievements);

  return (
    <ul className="divide-y divide-line border-y border-line">
      {ACHIEVEMENTS.map((achievement) => {
        const date = unlocked[achievement.id];
        return (
          <li key={achievement.id} className="flex items-baseline justify-between gap-6 py-4">
            <div>
              <p className={date ? "text-ink" : "text-muted"}>{achievement.name}</p>
              <p className="mt-1 text-sm text-muted">{achievement.description}</p>
            </div>
            <p className="shrink-0 text-sm text-muted">
              {date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Locked"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function AchievementsView() {
  return (
    <section>
      <Link href="/statistics" className="text-sm text-muted">
        Progress
      </Link>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Achievements</h1>
      <div className="mt-8">
        <AchievementsList />
      </div>
    </section>
  );
}
