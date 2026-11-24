import { describe, expect, it } from "vitest";
import {
  countSolutions,
  emptyGrid,
  generateSolution,
  gridsEqual,
  mulberry32,
  solve,
} from "@/engine";

describe("solver", () => {
  const solution = generateSolution(mulberry32(11));

  it("solves a unique puzzle and stops after two solutions", () => {
    const puzzle = solution.slice();
    puzzle[0] = 0;
    puzzle[10] = 0;
    puzzle[20] = 0;
    expect(countSolutions(puzzle, 2)).toBe(1);
    expect(gridsEqual(solve(puzzle) ?? emptyGrid(), solution)).toBe(true);
  });

  it("rejects an invalid grid and counts an empty grid as ambiguous", () => {
    const invalid = solution.slice();
    invalid[1] = invalid[0];
    expect(countSolutions(invalid, 2)).toBe(0);
    expect(solve(invalid)).toBeNull();
    expect(countSolutions(emptyGrid(), 2)).toBe(2);
  });
});
