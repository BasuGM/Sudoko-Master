import { countBits, digitsOf } from "../mask";
import { cellLabel } from "../grid";
import type { LogicState, SolveStep } from "../types";
import { eachHouse, houseLabel, uniqueIndexes } from "./shared";
import { formatDigits } from "../mask";

export function findNakedPairs(state: LogicState): SolveStep | null {
  for (const house of eachHouse()) {
    const pairs: { index: number; mask: number }[] = [];
    for (const index of house.cells) {
      if (state.grid[index] !== 0) continue;
      if (countBits(state.candidates[index]) === 2) {
        pairs.push({ index, mask: state.candidates[index] });
      }
    }

    for (let left = 0; left < pairs.length; left += 1) {
      for (let right = left + 1; right < pairs.length; right += 1) {
        if (pairs[left].mask !== pairs[right].mask) continue;
        const mask = pairs[left].mask;
        const eliminations: { index: number; digit: ReturnType<typeof digitsOf>[number] }[] = [];
        for (const index of house.cells) {
          if (index === pairs[left].index || index === pairs[right].index) continue;
          if (state.grid[index] !== 0) continue;
          const overlap = state.candidates[index] & mask;
          for (const digit of digitsOf(overlap)) eliminations.push({ index, digit });
        }
        if (eliminations.length === 0) continue;
        const label = houseLabel(house.kind, house.index);
        return {
          technique: "naked-pair",
          explanation: `In ${label}, ${cellLabel(pairs[left].index)} and ${cellLabel(pairs[right].index)} can only be ${formatDigits(digitsOf(mask))}. Those digits are removed from the rest of ${label}.`,
          cells: uniqueIndexes([
            pairs[left].index,
            pairs[right].index,
            ...eliminations.map((item) => item.index),
          ]),
          eliminations,
        };
      }
    }
  }
  return null;
}
