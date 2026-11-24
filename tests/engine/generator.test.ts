import { describe, expect, it } from "vitest";
import {
  classifyDifficulty,
  countSolutions,
  generateDailyPuzzle,
  generatePuzzle,
  gridsEqual,
  logicalSolve,
} from "@/engine";

describe("generator", () => {
  it("builds a deterministic, unique, logically solvable easy puzzle", () => {
    const first = generatePuzzle("easy", 42);
    const second = generatePuzzle("easy", 42);
    expect(second.puzzle).toEqual(first.puzzle);
    expect(countSolutions(first.puzzle, 2)).toBe(1);
    const solved = logicalSolve(first.puzzle);
    expect(solved.solved).toBe(true);
    expect(gridsEqual(solved.grid, first.solution)).toBe(true);
    expect(classifyDifficulty(solved.steps, true)).toBe("easy");
    for (let index = 0; index < 81; index += 1) {
      if (first.puzzle[index] !== 0) expect(first.puzzle[index]).toBe(first.solution[index]);
    }
  });

  it("reproduces a hard puzzle and an expert puzzle from known seeds", () => {
    const hard = generatePuzzle("hard", 546);
    const expert = generatePuzzle("expert", 7);
    expect(classifyDifficulty(logicalSolve(hard.puzzle).steps, true)).toBe("hard");
    expect(classifyDifficulty(logicalSolve(expert.puzzle).steps, true)).toBe("expert");
    expect(countSolutions(hard.puzzle, 2)).toBe(1);
    expect(countSolutions(expert.puzzle, 2)).toBe(1);
  });

  it("keeps the daily puzzle stable for a date", () => {
    const first = generateDailyPuzzle("2026-11-24");
    const second = generateDailyPuzzle("2026-11-24");
    expect(first.difficulty).toBe("medium");
    expect(second.puzzle).toEqual(first.puzzle);
    expect(countSolutions(first.puzzle, 2)).toBe(1);
  });
});
