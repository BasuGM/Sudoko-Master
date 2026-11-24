import { create } from "zustand";
import type { Difficulty } from "@/engine";
import { achievementsEarned } from "@/lib/achievements";
import { todayKey } from "@/lib/dates";
import { emptyStats, summarize, type StatsData } from "@/lib/stats";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

interface StatisticsStore extends StatsData {
  hydrate: () => void;
  recordCompletion: (input: {
    difficulty: Difficulty;
    timeMs: number;
    mistakes: number;
    hints: number;
    dailyDate: string | null;
  }) => string[];
  recordAbandon: (difficulty: Difficulty) => void;
}

function persist(state: StatisticsStore) {
  const data: StatsData = {
    version: 1,
    byDifficulty: state.byDifficulty,
    dailyDates: state.dailyDates,
    playDates: state.playDates,
    recentTimes: state.recentTimes,
    achievements: state.achievements,
  };
  writeStorage(STORAGE_KEYS.stats, data);
}

export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  ...emptyStats(),
  hydrate: () => {
    const stored = readStorage<StatsData>(STORAGE_KEYS.stats);
    if (!stored || stored.version !== 1 || !stored.byDifficulty) return;
    set({ ...emptyStats(), ...stored, version: 1 });
  },
  recordCompletion: ({ difficulty, timeMs, mistakes, hints, dailyDate }) => {
    const state = get();
    const row = state.byDifficulty[difficulty];
    const today = dailyDate ?? todayKey(new Date());
    const playDates = state.playDates.includes(today) ? state.playDates : [...state.playDates, today];
    const dailyDates =
      dailyDate && !state.dailyDates.includes(dailyDate)
        ? [...state.dailyDates, dailyDate]
        : state.dailyDates;
    const next: StatsData = {
      version: 1,
      byDifficulty: {
        ...state.byDifficulty,
        [difficulty]: {
          played: row.played + 1,
          completed: row.completed + 1,
          abandoned: row.abandoned,
          bestMs: row.bestMs == null ? timeMs : Math.min(row.bestMs, timeMs),
          totalTimeMs: row.totalTimeMs + timeMs,
          totalMistakes: row.totalMistakes + mistakes,
        },
      },
      dailyDates,
      playDates,
      recentTimes: [...state.recentTimes, timeMs].slice(-24),
      achievements: state.achievements,
    };
    const summary = summarize(next, todayKey(new Date()));
    const earned = achievementsEarned(summary, { difficulty, timeMs, mistakes, hints });
    const unlocked = earned.filter((id) => !next.achievements[id]);
    const achievements = { ...next.achievements };
    const stamped = new Date().toISOString();
    for (const id of unlocked) achievements[id] = stamped;
    set({ ...next, achievements });
    persist(get());
    return unlocked;
  },
  recordAbandon: (difficulty) => {
    const state = get();
    const row = state.byDifficulty[difficulty];
    set({
      byDifficulty: {
        ...state.byDifficulty,
        [difficulty]: { ...row, played: row.played + 1, abandoned: row.abandoned + 1 },
      },
    });
    persist(get());
  },
}));
