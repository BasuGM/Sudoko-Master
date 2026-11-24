import { bit, digitsOf, hasBit } from "../mask";
import { cellLabel } from "../grid";
import type { Digit, LogicState, SolveStep } from "../types";
import { eachHouse, houseLabel, uniqueIndexes } from "./shared";
import { formatDigits } from "../mask";

export function findHiddenPairs(state: LogicState): SolveStep | null {
  for (const house of eachHouse()) {
    const positions: number[][] = Array.from({ length: 10 }, () => []);
    for (const index of house.cells) {
      if (state.grid[index] !== 0) continue;
      for (let digit = 1; digit <= 9; digit += 1) {
        if (hasBit(state.candidates[index], digit)) positions[digit].push(index);
      }
    }

    for (let first = 1; first <= 8; first += 1) {
      for (let second = first + 1; second <= 9; second += 1) {
        const left = positions[first];
        const right = positions[second];
        if (left.length !== 2 || right.length !== 2) continue;
        if (left[0] !== right[0] || left[1] !== right[1]) continue;
        const keep = bit(first) | bit(second);
        const eliminations: { index: number; digit: Digit }[] = [];
        for (const index of left) {
          for (const digit of digitsOf(state.candidates[index] & ~keep)) {
            eliminations.push({ index, digit });
          }
        }
        if (eliminations.length === 0) continue;
        const label = houseLabel(house.kind, house.index);
        return {
          technique: "hidden-pair",
          explanation: `In ${label}, ${formatDigits([first, second])} appear only in ${cellLabel(left[0])} and ${cellLabel(left[1])}. Other candidates are removed from those two cells.`,
          cells: uniqueIndexes([...left, ...eliminations.map((item) => item.index)]),
          eliminations,
        };
      }
    }
  }
  return null;
}
