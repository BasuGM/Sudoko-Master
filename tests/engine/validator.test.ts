import { describe, expect, it } from "vitest";
import {
  conflictIndexes,
  generateSolution,
  isSolved,
  isValidPlacement,
  mulberry32,
  parsePuzzle,
  type Digit,
} from "@/engine";

describe("validator", () => {
  const solution = generateSolution(mulberry32(7));

  it("accepts a completed grid", () => {
    expect(isSolved(solution)).toBe(true);
    expect(conflictIndexes(solution)).toEqual([]);
  });

  it("flags a repeated digit in a row", () => {
    const grid = solution.slice();
    grid[1] = grid[0];
    expect(conflictIndexes(grid).length).toBeGreaterThan(0);
    expect(
      isValidPlacement(
        solution.map((value, index) => (index === 0 ? 0 : value)),
        0,
        solution[0] as Digit,
      ),
    ).toBe(true);
  });

  it("parses dots and zeros and rejects bad input", () => {
    const text = solution.map((value, index) => (index % 2 === 0 ? "." : String(value))).join("");
    const parsed = parsePuzzle(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.grid[0]).toBe(0);

    expect(parsePuzzle("123").ok).toBe(false);
    expect(parsePuzzle(`${"1".repeat(80)}x`).ok).toBe(false);

    const duplicated = solution.slice();
    duplicated[1] = duplicated[0];
    const bad = parsePuzzle(duplicated.join(""));
    expect(bad.ok).toBe(false);
  });
});
