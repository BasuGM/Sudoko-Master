import type { LogicState, SolveStep } from "../types";
import { findFish } from "./fish";

export function findSwordfish(state: LogicState): SolveStep | null {
  return findFish(state, 3, "swordfish", "Swordfish");
}
