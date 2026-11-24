import { countBits, digitsOf, formatDigits } from "../mask";
import type { LogicState, SolveStep } from "../types";
import { combinations, eachHouse, houseLabel, uniqueIndexes } from "./shared";

export function findNakedTriples(state: LogicState): SolveStep | null {
  for (const house of eachHouse()) {
    const open = house.cells.filter((index) => {
      if (state.grid[index] !== 0) return false;
      const count = countBits(state.candidates[index]);
      return count === 2 || count === 3;
    });
    if (open.length < 3) continue;

    for (const triple of combinations(open, 3)) {
      const union =
        state.candidates[triple[0]] | state.candidates[triple[1]] | state.candidates[triple[2]];
      if (countBits(union) !== 3) continue;
      const eliminations = [];
      for (const index of house.cells) {
        if (triple.includes(index) || state.grid[index] !== 0) continue;
        for (const digit of digitsOf(state.candidates[index] & union)) {
          eliminations.push({ index, digit });
        }
      }
      if (eliminations.length === 0) continue;
      const label = houseLabel(house.kind, house.index);
      return {
        technique: "naked-triple",
        explanation: `In ${label}, three cells use only ${formatDigits(digitsOf(union))}. Those digits are removed from the rest of ${label}.`,
        cells: uniqueIndexes([...triple, ...eliminations.map((item) => item.index)]),
        eliminations,
      };
    }
  }
  return null;
}
