import { digitsOf } from "../mask";
import type { Digit, LogicState, SolveStep } from "../types";
import { combinations, eachHouse, houseLabel, uniqueIndexes } from "./shared";
import { formatDigits } from "../mask";

export function findHiddenTriples(state: LogicState): SolveStep | null {
  for (const house of eachHouse()) {
    const positions: number[][] = Array.from({ length: 10 }, () => []);
    for (const index of house.cells) {
      if (state.grid[index] !== 0) continue;
      for (const digit of digitsOf(state.candidates[index])) positions[digit].push(index);
    }

    const present = [];
    for (let digit = 1; digit <= 9; digit += 1) {
      if (positions[digit].length > 0) present.push(digit);
    }

    for (const triple of combinations(present, 3)) {
      const cells = new Set<number>();
      for (const digit of triple) for (const index of positions[digit]) cells.add(index);
      if (cells.size !== 3) continue;

      const keep = new Set(triple);
      const eliminations: { index: number; digit: Digit }[] = [];
      for (const index of cells) {
        for (const digit of digitsOf(state.candidates[index])) {
          if (!keep.has(digit)) eliminations.push({ index, digit });
        }
      }
      if (eliminations.length === 0) continue;

      const label = houseLabel(house.kind, house.index);
      return {
        technique: "hidden-triple",
        explanation: `In ${label}, ${formatDigits(triple)} appear only in three cells. Other candidates are removed from those cells.`,
        cells: uniqueIndexes([...cells, ...eliminations.map((item) => item.index)]),
        eliminations,
      };
    }
  }
  return null;
}
