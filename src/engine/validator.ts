import { HOUSES, PEERS, emptyGrid, isDigit } from "./grid";
import type { Digit, Grid } from "./types";

export function isValidPlacement(grid: Grid, index: number, digit: Digit): boolean {
  if (grid[index] !== 0) return false;
  for (const peer of PEERS[index]) {
    if (grid[peer] === digit) return false;
  }
  return true;
}

export function conflictIndexes(grid: Grid): number[] {
  const conflicts = new Set<number>();
  for (const house of HOUSES) {
    const seen = new Map<number, number[]>();
    for (const index of house) {
      const value = grid[index];
      if (!value) continue;
      const list = seen.get(value);
      if (list) list.push(index);
      else seen.set(value, [index]);
    }
    for (const list of seen.values()) {
      if (list.length > 1) {
        for (const index of list) conflicts.add(index);
      }
    }
  }
  return [...conflicts];
}

export function isComplete(grid: Grid): boolean {
  return grid.every((value) => value !== 0);
}

export function isSolved(grid: Grid): boolean {
  return isComplete(grid) && conflictIndexes(grid).length === 0;
}

export type ParseResult = { ok: true; grid: Grid } | { ok: false; error: string };

export function parsePuzzle(input: string): ParseResult {
  const compact = input.replace(/\s+/g, "");
  if (!compact) return { ok: false, error: "Enter a puzzle." };
  if (compact.length !== 81) {
    return {
      ok: false,
      error: "A puzzle needs 81 cells. Use digits 1–9, and dots or zeros for empty cells.",
    };
  }

  const grid = emptyGrid();
  for (let index = 0; index < 81; index += 1) {
    const character = compact[index];
    if (character === "." || character === "0") continue;
    const value = Number(character);
    if (!isDigit(value)) {
      return { ok: false, error: "Only digits 1–9, zeros, and dots are allowed." };
    }
    grid[index] = value;
  }

  if (conflictIndexes(grid).length > 0) {
    return { ok: false, error: "This puzzle repeats a digit in a row, column, or box." };
  }

  return { ok: true, grid };
}
