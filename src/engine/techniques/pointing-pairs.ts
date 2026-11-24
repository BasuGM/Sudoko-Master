import { hasBit } from "../mask";
import { BOXES, COLS, ROWS, boxOf, colOf, rowOf } from "../grid";
import type { Digit, LogicState, SolveStep } from "../types";
import { uniqueIndexes } from "./shared";

export function findPointingPairs(state: LogicState): SolveStep | null {
  for (let box = 0; box < 9; box += 1) {
    for (let digit = 1; digit <= 9; digit += 1) {
      const spots = BOXES[box].filter(
        (index) => state.grid[index] === 0 && hasBit(state.candidates[index], digit),
      );
      if (spots.length < 2 || spots.length > 3) continue;

      const rows = new Set(spots.map(rowOf));
      const columns = new Set(spots.map(colOf));

      if (rows.size === 1) {
        const row = spots[0] === undefined ? 0 : rowOf(spots[0]);
        const step = eliminateOutside(
          state,
          digit as Digit,
          spots,
          ROWS[row].filter((index) => boxOf(index) !== box),
          `In box ${box + 1}, ${digit} is confined to row ${row + 1}, so it is removed from the rest of that row.`,
        );
        if (step) return step;
      }

      if (columns.size === 1) {
        const column = spots[0] === undefined ? 0 : colOf(spots[0]);
        const step = eliminateOutside(
          state,
          digit as Digit,
          spots,
          COLS[column].filter((index) => boxOf(index) !== box),
          `In box ${box + 1}, ${digit} is confined to column ${column + 1}, so it is removed from the rest of that column.`,
        );
        if (step) return step;
      }
    }
  }
  return null;
}

function eliminateOutside(
  state: LogicState,
  digit: Digit,
  pattern: number[],
  outside: number[],
  explanation: string,
): SolveStep | null {
  const eliminations = outside
    .filter((index) => state.grid[index] === 0 && hasBit(state.candidates[index], digit))
    .map((index) => ({ index, digit }));
  if (eliminations.length === 0) return null;
  return {
    technique: "pointing-pair",
    explanation,
    cells: uniqueIndexes([...pattern, ...eliminations.map((item) => item.index)]),
    eliminations,
  };
}
