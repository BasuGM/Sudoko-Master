"use client";

import Link from "next/link";
import { DIFFICULTIES } from "@/constants/game";
import { formatDuration, formatPercent } from "@/lib/time";
import { summarize } from "@/lib/stats";
import { useToday } from "@/hooks/use-today";
import { AchievementsList } from "@/components/achievements/AchievementsView";
import { useStatisticsStore } from "@/store/statistics-store";

export function ProgressView() {
  const data = useStatisticsStore((state) => state);
  const today = useToday();
  const summary = summarize(data, today ?? "1970-01-01");

  return (
    <section>
      <p className="text-sm text-muted">Progress</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">A quiet record.</h1>
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        <Stat label="Played" value={String(summary.played)} />
        <Stat label="Completed" value={String(summary.completed)} />
        <Stat label="Win rate" value={formatPercent(summary.winRate)} />
        <Stat label="Streak" value={String(summary.currentStreak)} />
        <Stat label="Best time" value={summary.bestMs == null ? "—" : formatDuration(summary.bestMs)} />
        <Stat label="Average" value={summary.completed ? formatDuration(summary.averageTimeMs) : "—"} />
        <Stat label="Mistakes" value={summary.completed ? summary.averageMistakes.toFixed(1) : "—"} />
        <Stat label="Longest streak" value={String(summary.longestStreak)} />
      </dl>

      <h2 className="mt-12 text-sm uppercase tracking-[0.16em] text-muted">Difficulty</h2>
      <ul className="mt-4 space-y-4">
        {DIFFICULTIES.map((item) => {
          const row = data.byDifficulty[item.id];
          const rate = row.played === 0 ? 0 : row.completed / row.played;
          return (
            <li key={item.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted tabular-nums">
                  {row.completed}/{row.played} · {row.bestMs == null ? "—" : formatDuration(row.bestMs)}
                </span>
              </div>
              <div className="mt-2 h-px bg-line">
                <div className="h-px bg-accent" style={{ width: `${Math.round(rate * 100)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 text-sm uppercase tracking-[0.16em] text-muted">Recent times</h2>
      <Sparkline values={data.recentTimes} />

      <div className="mt-12 flex items-baseline justify-between">
        <h2 className="text-sm uppercase tracking-[0.16em] text-muted">Achievements</h2>
        <Link href="/achievements" className="text-sm text-muted underline underline-offset-4">
          All
        </Link>
      </div>
      <div className="mt-4">
        <AchievementsList />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl tabular-nums">{value}</dd>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <p className="mt-3 text-sm text-muted">Finish a few puzzles to see a trend.</p>;
  }
  const width = 320;
  const height = 72;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 8 - ((value - min) / span) * (height - 16);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full max-w-md" role="img" aria-label="Recent completion times">
      <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={points} />
    </svg>
  );
}
