import { countBits, digitsOf, hasBit } from "../mask";
import { boxOf, cellLabel, colOf, rowOf } from "../grid";
import type { Digit, LogicState, SolveStep } from "../types";
import { uniqueIndexes } from "./shared";

function sees(left: number, right: number): boolean {
  return (
    left !== right &&
    (rowOf(left) === rowOf(right) || colOf(left) === colOf(right) || boxOf(left) === boxOf(right))
  );
}

export function findXYWing(state: LogicState): SolveStep | null {
  const bivalue: number[] = [];
  for (let index = 0; index < 81; index += 1) {
    if (state.grid[index] === 0 && countBits(state.candidates[index]) === 2) bivalue.push(index);
  }

  for (const pivot of bivalue) {
    const pivotDigits = digitsOf(state.candidates[pivot]);
    const first = pivotDigits[0];
    const second = pivotDigits[1];
    if (first === undefined || second === undefined) continue;

    for (const left of bivalue) {
      if (left === pivot || !sees(pivot, left)) continue;
      const leftDigits = digitsOf(state.candidates[left]);
      if (leftDigits.length !== 2 || !leftDigits.includes(first)) continue;
      const wing = leftDigits[0] === first ? leftDigits[1] : leftDigits[0];
      if (wing === undefined || wing === second) continue;

      for (const right of bivalue) {
        if (right === pivot || right === left || !sees(pivot, right)) continue;
        const rightDigits = digitsOf(state.candidates[right]);
        if (rightDigits.length !== 2 || !rightDigits.includes(second) || !rightDigits.includes(wing)) {
          continue;
        }

        const eliminations: { index: number; digit: Digit }[] = [];
        for (let index = 0; index < 81; index += 1) {
          if (state.grid[index] !== 0 || index === pivot || index === left || index === right) continue;
          if (!sees(index, left) || !sees(index, right)) continue;
          if (!hasBit(state.candidates[index], wing)) continue;
          eliminations.push({ index, digit: wing });
        }
        if (eliminations.length === 0) continue;

        return {
          technique: "xy-wing",
          explanation: `${capitalize(cellLabel(pivot))} is ${first} or ${second}. It links ${cellLabel(left)} (${first} or ${wing}) with ${cellLabel(right)} (${second} or ${wing}). Any cell that sees both links cannot be ${wing}.`,
          cells: uniqueIndexes([pivot, left, right, ...eliminations.map((item) => item.index)]),
          eliminations,
        };
      }
    }
  }

  return null;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
