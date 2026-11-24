import type { Difficulty } from "@/engine";
import type { StatsSummary } from "@/lib/stats";

export interface Achievement {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-victory", name: "First Victory", description: "Complete a puzzle." },
  { id: "speed-solver", name: "Speed Solver", description: "Finish a puzzle in under five minutes." },
  { id: "perfect-game", name: "Perfect Game", description: "Finish with no mistakes and no hints." },
  { id: "seven-day-streak", name: "Seven-Day Streak", description: "Complete a puzzle seven days in a row." },
  { id: "expert-solver", name: "Expert Solver", description: "Complete an expert puzzle." },
  { id: "no-hint", name: "No-Hint Challenge", description: "Complete a puzzle without taking a hint." },
  { id: "hundred", name: "100 Games Completed", description: "Complete one hundred puzzles." },
];

export interface CompletionSnapshot {
  difficulty: Difficulty;
  timeMs: number;
  mistakes: number;
  hints: number;
}

export function achievementsEarned(summary: StatsSummary, latest: CompletionSnapshot): string[] {
  const earned: string[] = [];
  if (summary.completed >= 1) earned.push("first-victory");
  if (latest.timeMs <= 5 * 60 * 1000) earned.push("speed-solver");
  if (latest.mistakes === 0 && latest.hints === 0) earned.push("perfect-game");
  if (summary.currentStreak >= 7 || summary.longestStreak >= 7) earned.push("seven-day-streak");
  if (latest.difficulty === "expert") earned.push("expert-solver");
  if (latest.hints === 0) earned.push("no-hint");
  if (summary.completed >= 100) earned.push("hundred");
  return earned;
}
