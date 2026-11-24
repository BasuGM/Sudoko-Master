import { ALL_CANDIDATES, bit } from "./mask";
import { PEERS } from "./grid";
import type { Digit, Grid } from "./types";

export function autoCandidates(grid: Grid): number[] {
  const masks = Array<number>(81).fill(0);
  for (let index = 0; index < 81; index += 1) {
    if (grid[index] !== 0) continue;
    let mask = ALL_CANDIDATES;
    for (const peer of PEERS[index]) {
      const value = grid[peer];
      if (value) mask &= ~bit(value);
    }
    masks[index] = mask;
  }
  return masks;
}

/** Clear a placed digit from peer notes and wipe the placed cell. */
export function notesAfterPlacement(notes: number[], index: number, digit: Digit): number[] {
  const next = notes.slice();
  next[index] = 0;
  const flag = bit(digit);
  for (const peer of PEERS[index]) next[peer] &= ~flag;
  return next;
}

export function emptyNotes(): number[] {
  return Array<number>(81).fill(0);
}
