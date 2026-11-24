import type { CellValue, Digit, Grid } from "./types";

export const CELLS = 81;

export function rowOf(index: number): number {
  return Math.floor(index / 9);
}

export function colOf(index: number): number {
  return index % 9;
}

export function boxOf(index: number): number {
  return Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3);
}

export function indexOf(row: number, column: number): number {
  return row * 9 + column;
}

export function cellLabel(index: number): string {
  return `row ${rowOf(index) + 1}, column ${colOf(index) + 1}`;
}

function buildHouses(pick: (index: number) => number): number[][] {
  const houses: number[][] = Array.from({ length: 9 }, () => []);
  for (let index = 0; index < CELLS; index += 1) houses[pick(index)].push(index);
  return houses;
}

export const ROWS = buildHouses(rowOf);
export const COLS = buildHouses(colOf);
export const BOXES = buildHouses(boxOf);
export const HOUSES = [...ROWS, ...COLS, ...BOXES];

export const PEERS: number[][] = Array.from({ length: CELLS }, (_, index) => {
  const peers = new Set<number>();
  for (const cell of ROWS[rowOf(index)]) if (cell !== index) peers.add(cell);
  for (const cell of COLS[colOf(index)]) if (cell !== index) peers.add(cell);
  for (const cell of BOXES[boxOf(index)]) if (cell !== index) peers.add(cell);
  return [...peers];
});

export function emptyGrid(): Grid {
  return Array<CellValue>(CELLS).fill(0);
}

export function cloneGrid(grid: Grid): Grid {
  return grid.slice();
}

export function gridsEqual(left: Grid, right: Grid): boolean {
  for (let index = 0; index < CELLS; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

export function isDigit(value: number): value is Digit {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

export function gridToString(grid: Grid): string {
  return grid.map((value) => (value === 0 ? "." : String(value))).join("");
}
