import { gridsEqual } from "./grid";
import { hashSeed, mulberry32, randomSeed, shuffle } from "./random";
import { logicalSolve } from "./logical-solver";
import { countSolutions } from "./solver";
import { classifyDifficulty, difficultyRank } from "./difficulty";
import type { CellValue, Difficulty, GeneratedPuzzle, Grid } from "./types";

const ATTEMPTS: Record<Difficulty, number> = {
  easy: 16,
  medium: 48,
  hard: 220,
  expert: 80,
};

const EASY_CLUE_TARGET = 46;

export function generateSolution(rng: () => number): Grid {
  const grid: Grid = Array<CellValue>(81).fill(0);
  const rows = Array<number>(9).fill(0);
  const cols = Array<number>(9).fill(0);
  const boxes = Array<number>(9).fill(0);

  const fill = (index: number): boolean => {
    if (index === 81) return true;
    const row = Math.floor(index / 9);
    const column = index % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(column / 3);
    const used = rows[row] | cols[column] | boxes[box];
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);

    for (const digit of digits) {
      const flag = 1 << (digit - 1);
      if (used & flag) continue;
      grid[index] = digit as CellValue;
      rows[row] |= flag;
      cols[column] |= flag;
      boxes[box] |= flag;
      if (fill(index + 1)) return true;
      rows[row] ^= flag;
      cols[column] ^= flag;
      boxes[box] ^= flag;
      grid[index] = 0;
    }
    return false;
  };

  if (!fill(0)) throw new Error("Could not fill a Sudoku grid.");
  return grid;
}

function symmetricOrder(rng: () => number): number[][] {
  const pairs: number[][] = [];
  for (let index = 0; index < 81; index += 1) {
    const partner = 80 - index;
    if (index < partner) pairs.push([index, partner]);
    else if (index === partner) pairs.push([index]);
  }
  return shuffle(pairs, rng);
}

function singleOrder(rng: () => number): number[][] {
  return shuffle(
    Array.from({ length: 81 }, (_, index) => [index]),
    rng,
  );
}

function clueCount(grid: Grid): number {
  let count = 0;
  for (const value of grid) if (value !== 0) count += 1;
  return count;
}

function carve(solution: Grid, difficulty: Difficulty, rng: () => number): Grid | null {
  const puzzle = solution.slice();
  const target = difficultyRank(difficulty);
  const groups = difficulty === "easy" ? symmetricOrder(rng) : singleOrder(rng);

  for (const cells of groups) {
    const snapshot = puzzle.slice();
    for (const index of cells) puzzle[index] = 0;

    const solved = logicalSolve(puzzle);
    if (!solved.solved || !gridsEqual(solved.grid, solution)) {
      puzzle.splice(0, puzzle.length, ...snapshot);
      continue;
    }

    const rating = classifyDifficulty(solved.steps, true);
    if (!rating) {
      puzzle.splice(0, puzzle.length, ...snapshot);
      continue;
    }

    if (difficulty === "easy") {
      if (rating !== "easy") {
        puzzle.splice(0, puzzle.length, ...snapshot);
        continue;
      }
      if (clueCount(puzzle) <= EASY_CLUE_TARGET) return puzzle.slice();
      continue;
    }

    if (rating === difficulty) return puzzle.slice();
    if (difficultyRank(rating) > target) {
      puzzle.splice(0, puzzle.length, ...snapshot);
    }
  }

  return null;
}

export function generatePuzzle(difficulty: Difficulty, seed = randomSeed()): GeneratedPuzzle {
  for (let attempt = 0; attempt < ATTEMPTS[difficulty]; attempt += 1) {
    const workingSeed = (seed + attempt * 9973) >>> 0;
    const rng = mulberry32(workingSeed || 1);
    const solution = generateSolution(rng);
    const puzzle = carve(solution, difficulty, rng);
    if (!puzzle) continue;
    if (countSolutions(puzzle, 2) !== 1) continue;
    return { puzzle, solution, difficulty, seed: workingSeed || 1 };
  }
  throw new Error(`Could not generate a ${difficulty} puzzle from seed ${seed}.`);
}

export function dailySeed(date: string): number {
  return hashSeed(`sudoku-master-daily-v1:${date}`);
}

export function generateDailyPuzzle(date: string): GeneratedPuzzle {
  return generatePuzzle("medium", dailySeed(date));
}
