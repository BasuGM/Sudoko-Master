"use client";

import { useState } from "react";
import { GameScreen } from "@/components/game/GameScreen";
import { useAppReady } from "@/components/layout/AppProvider";
import { monthDays, formatLongDate } from "@/lib/dates";
import { useToday } from "@/hooks/use-today";
import { createPuzzle } from "@/lib/create-puzzle";
import { dailySeed, generateDailyPuzzle } from "@/engine";
import { useGameStore } from "@/store/game-store";
import { useStatisticsStore } from "@/store/statistics-store";
import { summarize } from "@/lib/stats";

export function DailyView() {
  const today = useToday();
  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const dailyDate = useGameStore((state) => state.dailyDate);
  const dates = useStatisticsStore((state) => state.dailyDates);
  const stats = useStatisticsStore();
  const ready = useAppReady();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const playingToday = mode === "daily" && dailyDate === today && status !== "idle";

  async function start() {
    if (!today) return;
    setPending(true);
    setError("");
    try {
      const generated = await createPuzzle("medium", dailySeed(today));
      const fallback = generated.difficulty === "medium" ? generated : generateDailyPuzzle(today);
      useGameStore.getState().loadPuzzle({
        puzzle: fallback.puzzle,
        solution: fallback.solution,
        difficulty: "medium",
        mode: "daily",
        dailyDate: today,
        seed: fallback.seed,
        recordStats: !dates.includes(today),
      });
    } catch {
      setError("Today's puzzle needs another moment.");
    } finally {
      setPending(false);
    }
  }

  if (!ready || !today) return <div className="mx-auto h-16" />;
  if (playingToday) return <GameScreen />;

  const days = monthDays(today);
  const summary = summarize(stats, today);

  return (
    <section className="mx-auto max-w-xl">
      <p className="text-sm text-muted">Daily</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{formatLongDate(today)}</h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        The same medium puzzle for this UTC date. {dates.includes(today) ? "You already finished it." : "It is waiting."}
      </p>
      <button
        type="button"
        className="mt-8 border border-ink bg-ink px-4 py-2 text-sm text-paper disabled:opacity-40"
        disabled={pending}
        onClick={() => void start()}
      >
        {pending ? "Composing" : dates.includes(today) ? "Play again" : "Play today"}
      </button>
      {error ? <p className="mt-3 text-sm text-muted">{error}</p> : null}
      <p className="mt-10 text-sm text-muted">Streak {summary.currentStreak}</p>
      <ol className="mt-3 grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((day) => {
          const done = dates.includes(day.key);
          return (
            <li
              key={day.key}
              className={
                done
                  ? "bg-ink py-2 text-paper tabular-nums"
                  : day.today
                    ? "border border-ink py-2 tabular-nums"
                    : "border border-line py-2 text-muted tabular-nums"
              }
            >
              {day.day}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
