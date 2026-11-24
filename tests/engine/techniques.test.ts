import { describe, expect, it } from "vitest";
import type { Grid, LogicState } from "@/engine";
import { findNakedSingles } from "@/engine/techniques/naked-singles";
import { findHiddenSingles } from "@/engine/techniques/hidden-singles";
import { findNakedPairs } from "@/engine/techniques/naked-pairs";
import { findHiddenPairs } from "@/engine/techniques/hidden-pairs";
import { findPointingPairs } from "@/engine/techniques/pointing-pairs";
import { findBoxLineReductions } from "@/engine/techniques/box-line-reduction";
import { findNakedTriples } from "@/engine/techniques/naked-triples";
import { findXWing } from "@/engine/techniques/x-wing";
import { findSwordfish } from "@/engine/techniques/swordfish";
import { findHiddenTriples } from "@/engine/techniques/hidden-triples";
import { findXYWing } from "@/engine/techniques/xy-wing";
import { autoCandidates, generateSolution, indexOf, logicalSolve, mulberry32, nextStep } from "@/engine";

function open(state: LogicState, index: number, digits: number[]) {
  state.grid[index] = 0;
  state.candidates[index] = digits.reduce((mask, digit) => mask | (1 << (digit - 1)), 0);
}

function blank(): LogicState {
  return {
    grid: Array<Grid[number]>(81).fill(1),
    candidates: Array<number>(81).fill(0),
  };
}

describe("logical techniques", () => {
  it("finds a naked single", () => {
    const state = blank();
    open(state, 0, [4]);
    const step = findNakedSingles(state);
    expect(step?.placements).toEqual([{ index: 0, digit: 4 }]);
  });

  it("finds a hidden single", () => {
    const state = blank();
    open(state, 0, [1, 2, 3]);
    open(state, 1, [2, 3]);
    open(state, 2, [2, 3]);
    const step = findHiddenSingles(state);
    expect(step?.placements).toEqual([{ index: 0, digit: 1 }]);
  });

  it("finds a naked pair", () => {
    const state = blank();
    open(state, 0, [4, 7]);
    open(state, 1, [4, 7]);
    open(state, 2, [4, 7, 9]);
    const step = findNakedPairs(state);
    expect(step?.eliminations).toEqual(
      expect.arrayContaining([
        { index: 2, digit: 4 },
        { index: 2, digit: 7 },
      ]),
    );
  });

  it("finds a hidden pair", () => {
    const state = blank();
    open(state, 0, [1, 2, 3]);
    open(state, 1, [1, 2, 4]);
    open(state, 2, [3, 4, 5]);
    const step = findHiddenPairs(state);
    expect(step?.eliminations).toEqual(
      expect.arrayContaining([
        { index: 0, digit: 3 },
        { index: 1, digit: 4 },
      ]),
    );
  });

  it("finds a pointing pair", () => {
    const state = blank();
    open(state, 0, [5, 2]);
    open(state, 1, [5, 3]);
    open(state, 3, [5, 8]);
    const step = findPointingPairs(state);
    expect(step?.eliminations).toEqual([{ index: 3, digit: 5 }]);
  });

  it("finds a box/line reduction", () => {
    const state = blank();
    open(state, 0, [6, 1]);
    open(state, 1, [6, 2]);
    open(state, 9, [6, 3]);
    const step = findBoxLineReductions(state);
    expect(step?.eliminations).toEqual([{ index: 9, digit: 6 }]);
  });

  it("finds a naked triple", () => {
    const state = blank();
    open(state, 0, [1, 2]);
    open(state, 1, [1, 3]);
    open(state, 2, [2, 3]);
    open(state, 3, [1, 2, 3, 4]);
    const step = findNakedTriples(state);
    expect(step?.eliminations).toEqual(
      expect.arrayContaining([
        { index: 3, digit: 1 },
        { index: 3, digit: 2 },
        { index: 3, digit: 3 },
      ]),
    );
  });

  it("finds an X-Wing", () => {
    const state = blank();
    open(state, indexOf(0, 0), [9]);
    open(state, indexOf(0, 1), [9]);
    open(state, indexOf(1, 0), [9]);
    open(state, indexOf(1, 1), [9]);
    open(state, indexOf(2, 0), [9, 1]);
    const step = findXWing(state);
    expect(step?.technique).toBe("x-wing");
    expect(step?.eliminations).toEqual(expect.arrayContaining([{ index: indexOf(2, 0), digit: 9 }]));
  });

  it("finds a swordfish", () => {
    const state = blank();
    open(state, indexOf(0, 0), [8]);
    open(state, indexOf(0, 1), [8]);
    open(state, indexOf(1, 1), [8]);
    open(state, indexOf(1, 2), [8]);
    open(state, indexOf(2, 0), [8]);
    open(state, indexOf(2, 2), [8]);
    open(state, indexOf(3, 0), [8, 1]);
    const step = findSwordfish(state);
    expect(step?.technique).toBe("swordfish");
    expect(step?.eliminations).toEqual(
      expect.arrayContaining([{ index: indexOf(3, 0), digit: 8 }]),
    );
  });

  it("finds a hidden triple", () => {
    const state = blank();
    open(state, 0, [1, 2, 4]);
    open(state, 1, [1, 3, 5]);
    open(state, 2, [2, 3]);
    const step = findHiddenTriples(state);
    expect(step?.eliminations).toEqual(
      expect.arrayContaining([
        { index: 0, digit: 4 },
        { index: 1, digit: 5 },
      ]),
    );
  });

  it("finds an XY-Wing", () => {
    const state = blank();
    open(state, 0, [1, 2]);
    open(state, 1, [1, 3]);
    open(state, 9, [2, 3]);
    open(state, 10, [3, 4]);
    const step = findXYWing(state);
    expect(step?.technique).toBe("xy-wing");
    expect(step?.eliminations).toEqual(expect.arrayContaining([{ index: 10, digit: 3 }]));
  });

  it("solves a nearly complete grid with a naked single", () => {
    const solution = generateSolution(mulberry32(3));
    const puzzle = solution.slice();
    puzzle[40] = 0;
    expect(nextStep(puzzle)?.technique).toBe("naked-single");
    expect(autoCandidates(puzzle)[40]).toBe(1 << (solution[40] - 1));
    const solved = logicalSolve(puzzle);
    expect(solved.solved).toBe(true);
    expect(solved.grid).toEqual(solution);
  });
});
