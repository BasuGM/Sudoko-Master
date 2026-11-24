import type { Difficulty } from "@/engine";
import { currentStreak, longestStreak } from "@/lib/dates";

export interface DifficultyStats {
  played: number;
  completed: number;
  abandoned: number;
  bestMs: number | null;
  totalTimeMs: number;
  totalMistakes: number;
}

export interface StatsData {
  version: 1;
  byDifficulty: Record<Difficulty, DifficultyStats>;
  dailyDates: string[];
  playDates: string[];
  recentTimes: number[];
  achievements: Record<string, string>;
}

export function emptyDifficultyStats(): DifficultyStats {
  return {
    played: 0,
    completed: 0,
    abandoned: 0,
    bestMs: null,
    totalTimeMs: 0,
    totalMistakes: 0,
  };
}

export function emptyStats(): StatsData {
  return {
    version: 1,
    byDifficulty: {
      easy: emptyDifficultyStats(),
      medium: emptyDifficultyStats(),
      hard: emptyDifficultyStats(),
      expert: emptyDifficultyStats(),
    },
    dailyDates: [],
    playDates: [],
    recentTimes: [],
    achievements: {},
  };
}

export interface StatsSummary {
  played: number;
  completed: number;
  abandoned: number;
  winRate: number;
  averageTimeMs: number;
  bestMs: number | null;
  averageMistakes: number;
  currentStreak: number;
  longestStreak: number;
}

export function summarize(data: StatsData, today: string): StatsSummary {
  const rows = Object.values(data.byDifficulty);
  const played = rows.reduce((sum, row) => sum + row.played, 0);
  const completed = rows.reduce((sum, row) => sum + row.completed, 0);
  const abandoned = rows.reduce((sum, row) => sum + row.abandoned, 0);
  const time = rows.reduce((sum, row) => sum + row.totalTimeMs, 0);
  const mistakes = rows.reduce((sum, row) => sum + row.totalMistakes, 0);
  const bestMs = rows.reduce<number | null>((best, row) => {
    if (row.bestMs == null) return best;
    return best == null ? row.bestMs : Math.min(best, row.bestMs);
  }, null);

  return {
    played,
    completed,
    abandoned,
    winRate: played === 0 ? 0 : completed / played,
    averageTimeMs: completed === 0 ? 0 : time / completed,
    bestMs,
    averageMistakes: completed === 0 ? 0 : mistakes / completed,
    currentStreak: currentStreak(data.playDates, today),
    longestStreak: longestStreak(data.playDates),
  };
}
