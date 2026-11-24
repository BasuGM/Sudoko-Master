import { countBits, digitsOf, hasBit } from "../mask";
import { colOf, rowOf } from "../grid";
import type { Digit, LogicState, SolveStep } from "../types";
import { eachHouse, houseLabel } from "./shared";

export function findHiddenSingles(state: LogicState): SolveStep | null {
  for (const house of eachHouse()) {
    for (let digit = 1; digit <= 9; digit += 1) {
      const spots: number[] = [];
      for (const index of house.cells) {
        if (state.grid[index] !== 0) continue;
        if (hasBit(state.candidates[index], digit)) spots.push(index);
      }
      if (spots.length !== 1) continue;
      const index = spots[0];
      if (countBits(state.candidates[index]) <= 1) continue;
      const where =
        house.kind === "row"
          ? `column ${colOf(index) + 1}`
          : house.kind === "column"
            ? `row ${rowOf(index) + 1}`
            : `row ${rowOf(index) + 1}, column ${colOf(index) + 1}`;
      return {
        technique: "hidden-single",
        explanation: `In ${houseLabel(house.kind, house.index)}, ${digit} can be placed only in ${where}. The other candidates in that cell are ${formatOthers(state.candidates[index], digit as Digit)}.`,
        cells: house.cells.slice(),
        placements: [{ index, digit: digit as Digit }],
      };
    }
  }
  return null;
}

function formatOthers(mask: number, digit: Digit): string {
  const others = digitsOf(mask).filter((value) => value !== digit);
  if (others.length === 0) return "cleared";
  return others.join(", ");
}
