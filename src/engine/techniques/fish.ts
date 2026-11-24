import { hasBit } from "../mask";
import { indexOf } from "../grid";
import type { Digit, LogicState, SolveStep, TechniqueId } from "../types";
import { combinations, uniqueIndexes } from "./shared";

export function findFish(
  state: LogicState,
  size: 2 | 3,
  technique: TechniqueId,
  name: string,
): SolveStep | null {
  return search(state, size, technique, name, "row") ?? search(state, size, technique, name, "column");
}

function search(
  state: LogicState,
  size: 2 | 3,
  technique: TechniqueId,
  name: string,
  base: "row" | "column",
): SolveStep | null {
  for (let digit = 1; digit <= 9; digit += 1) {
    const lines: number[][] = [];
    for (let line = 0; line < 9; line += 1) {
      const spots: number[] = [];
      for (let cross = 0; cross < 9; cross += 1) {
        const index = base === "row" ? indexOf(line, cross) : indexOf(cross, line);
        if (state.grid[index] === 0 && hasBit(state.candidates[index], digit)) spots.push(cross);
      }
      lines.push(spots);
    }

    const eligible: number[] = [];
    for (let line = 0; line < 9; line += 1) {
      const count = lines[line].length;
      if (size === 2 ? count === 2 : count >= 2 && count <= 3) eligible.push(line);
    }

    for (const combo of combinations(eligible, size)) {
      const cover = new Set<number>();
      for (const line of combo) for (const spot of lines[line]) cover.add(spot);
      if (cover.size !== size) continue;

      const pattern: number[] = [];
      for (const line of combo) {
        for (const spot of lines[line]) {
          pattern.push(base === "row" ? indexOf(line, spot) : indexOf(spot, line));
        }
      }

      const eliminations: { index: number; digit: Digit }[] = [];
      for (let line = 0; line < 9; line += 1) {
        if (combo.includes(line)) continue;
        for (const spot of cover) {
          const index = base === "row" ? indexOf(line, spot) : indexOf(spot, line);
          if (state.grid[index] === 0 && hasBit(state.candidates[index], digit)) {
            eliminations.push({ index, digit: digit as Digit });
          }
        }
      }
      if (eliminations.length === 0) continue;

      const baseLabel = base === "row" ? "rows" : "columns";
      const coverLabel = base === "row" ? "columns" : "rows";
      const baseNumbers = combo.map((line) => line + 1).join(", ");
      const coverNumbers = [...cover]
        .sort((left, right) => left - right)
        .map((spot) => spot + 1)
        .join(", ");

      return {
        technique,
        explanation: `${digit} forms a ${name} in ${baseLabel} ${baseNumbers}, limited to ${coverLabel} ${coverNumbers}. ${digit} is removed from those ${coverLabel} elsewhere.`,
        cells: uniqueIndexes([...pattern, ...eliminations.map((item) => item.index)]),
        eliminations,
      };
    }
  }
  return null;
}
