import { hasBit } from "../mask";
import { BOXES, COLS, ROWS, boxOf, colOf, rowOf } from "../grid";
import type { Digit, LogicState, SolveStep } from "../types";
import { uniqueIndexes } from "./shared";

export function findBoxLineReductions(state: LogicState): SolveStep | null {
  for (let row = 0; row < 9; row += 1) {
    const step = reduceLine(state, ROWS[row], "row", row, (index) => boxOf(index), (index) => rowOf(index) !== row);
    if (step) return step;
  }
  for (let column = 0; column < 9; column += 1) {
    const step = reduceLine(
      state,
      COLS[column],
      "column",
      column,
      (index) => boxOf(index),
      (index) => colOf(index) !== column,
    );
    if (step) return step;
  }
  return null;
}

function reduceLine(
  state: LogicState,
  line: number[],
  kind: "row" | "column",
  lineIndex: number,
  boxFor: (index: number) => number,
  outsideLine: (index: number) => boolean,
): SolveStep | null {
  for (let digit = 1; digit <= 9; digit += 1) {
    const spots = line.filter(
      (index) => state.grid[index] === 0 && hasBit(state.candidates[index], digit),
    );
    if (spots.length < 2) continue;
    const boxes = new Set(spots.map(boxFor));
    if (boxes.size !== 1) continue;
    const box = boxFor(spots[0]);
    const eliminations = BOXES[box]
      .filter(
        (index) =>
          outsideLine(index) && state.grid[index] === 0 && hasBit(state.candidates[index], digit),
      )
      .map((index) => ({ index, digit: digit as Digit }));
    if (eliminations.length === 0) continue;
    return {
      technique: "box-line-reduction",
      explanation: `In ${kind} ${lineIndex + 1}, every ${digit} sits inside box ${box + 1}. ${digit} is removed from the rest of that box.`,
      cells: uniqueIndexes([...spots, ...eliminations.map((item) => item.index)]),
      eliminations,
    };
  }
  return null;
}
