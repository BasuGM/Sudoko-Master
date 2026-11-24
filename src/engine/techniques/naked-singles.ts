import { digitsOf } from "../mask";
import { PEERS, cellLabel } from "../grid";
import type { LogicState, SolveStep } from "../types";
import { uniqueIndexes } from "./shared";

export function findNakedSingles(state: LogicState): SolveStep | null {
  for (let index = 0; index < 81; index += 1) {
    if (state.grid[index] !== 0) continue;
    const digits = digitsOf(state.candidates[index]);
    if (digits.length !== 1) continue;
    const digit = digits[0];
    const supporting = PEERS[index].filter((peer) => state.grid[peer] !== 0);
    return {
      technique: "naked-single",
      explanation: `${capitalize(cellLabel(index))} can only be ${digit}. Every other digit already appears in its row, column, or box.`,
      cells: uniqueIndexes([index, ...supporting]),
      placements: [{ index, digit }],
    };
  }
  return null;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
