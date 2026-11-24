import { ALL_CANDIDATES, countBits } from "./mask";
import { boxOf, colOf, rowOf } from "./grid";
import type { CellValue, Grid } from "./types";

interface Prepared {
  grid: Grid;
  rows: number[];
  cols: number[];
  boxes: number[];
}

function prepare(grid: Grid): Prepared | null {
  const copy = grid.slice();
  const rows = Array<number>(9).fill(0);
  const cols = Array<number>(9).fill(0);
  const boxes = Array<number>(9).fill(0);

  for (let index = 0; index < 81; index += 1) {
    const value = copy[index];
    if (!value) continue;
    const flag = 1 << (value - 1);
    const row = rowOf(index);
    const column = colOf(index);
    const box = boxOf(index);
    if (rows[row] & flag || cols[column] & flag || boxes[box] & flag) return null;
    rows[row] |= flag;
    cols[column] |= flag;
    boxes[box] |= flag;
  }

  return { grid: copy, rows, cols, boxes };
}

function search(
  prepared: Prepared,
  limit: number,
  capture: boolean,
): { found: number; solution: Grid | null } {
  const { grid, rows, cols, boxes } = prepared;
  let found = 0;
  let solution: Grid | null = null;

  const visit = (): boolean => {
    if (found >= limit) return true;

    let best = -1;
    let bestMask = 0;
    let bestCount = 10;

    for (let index = 0; index < 81; index += 1) {
      if (grid[index] !== 0) continue;
      const mask =
        ALL_CANDIDATES & ~(rows[rowOf(index)] | cols[colOf(index)] | boxes[boxOf(index)]);
      const count = countBits(mask);
      if (count === 0) return false;
      if (count < bestCount) {
        best = index;
        bestMask = mask;
        bestCount = count;
        if (count === 1) break;
      }
    }

    if (best === -1) {
      found += 1;
      if (capture && !solution) solution = grid.slice();
      return found >= limit;
    }

    const row = rowOf(best);
    const column = colOf(best);
    const box = boxOf(best);

    for (let digit = 1; digit <= 9; digit += 1) {
      const flag = 1 << (digit - 1);
      if ((bestMask & flag) === 0) continue;
      grid[best] = digit as CellValue;
      rows[row] |= flag;
      cols[column] |= flag;
      boxes[box] |= flag;
      if (visit()) return true;
      grid[best] = 0;
      rows[row] ^= flag;
      cols[column] ^= flag;
      boxes[box] ^= flag;
    }

    return false;
  };

  visit();
  return { found, solution };
}

/** Stop after `limit` solutions. Invalid puzzles return 0. */
export function countSolutions(grid: Grid, limit = 2): number {
  const prepared = prepare(grid);
  if (!prepared) return 0;
  return search(prepared, limit, false).found;
}

export function solve(grid: Grid): Grid | null {
  const prepared = prepare(grid);
  if (!prepared) return null;
  return search(prepared, 1, true).solution;
}

export function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(grid, 2) === 1;
}
