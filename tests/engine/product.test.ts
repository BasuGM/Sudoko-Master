import { describe, expect, it } from "vitest";
import { achievementsEarned } from "@/lib/achievements";
import { currentStreak, longestStreak } from "@/lib/dates";
import { emptyStats, summarize } from "@/lib/stats";
import { logicalSolve, parsePuzzle } from "@/engine";
import { LESSONS } from "@/content/lessons";

describe("statistics", () => {
  it("computes streaks, win rate, and achievements", () => {
    expect(currentStreak(["2026-11-22", "2026-11-23", "2026-11-24"], "2026-11-24")).toBe(3);
    expect(currentStreak(["2026-11-22", "2026-11-23"], "2026-11-24")).toBe(2);
    expect(currentStreak(["2026-11-20"], "2026-11-24")).toBe(0);
    expect(longestStreak(["2026-11-01", "2026-11-02", "2026-11-04"])).toBe(2);

    const data = emptyStats();
    data.byDifficulty.easy = {
      played: 4,
      completed: 3,
      abandoned: 1,
      bestMs: 90_000,
      totalTimeMs: 360_000,
      totalMistakes: 6,
    };
    data.playDates = ["2026-11-24"];
    const summary = summarize(data, "2026-11-24");
    expect(summary.winRate).toBe(0.75);
    expect(summary.averageTimeMs).toBe(120_000);
    expect(summary.averageMistakes).toBe(2);
    expect(
      achievementsEarned(summary, { difficulty: "easy", timeMs: 120_000, mistakes: 0, hints: 0 }),
    ).toEqual(expect.arrayContaining(["first-victory", "speed-solver", "perfect-game", "no-hint"]));
  });
});

describe("lessons", () => {
  it("opens each playable lesson on the technique it teaches", () => {
    for (const lesson of LESSONS) {
      if (!lesson.puzzle) continue;
      const parsed = parsePuzzle(lesson.puzzle);
      expect(parsed.ok, lesson.id).toBe(true);
      if (!parsed.ok) continue;
      const solved = logicalSolve(parsed.grid, true);
      expect(solved.steps[lesson.focusStep ?? 0]?.technique, lesson.id).toBe(lesson.id);
    }
  });
});
