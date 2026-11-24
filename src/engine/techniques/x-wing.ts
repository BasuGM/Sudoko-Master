import type { LogicState, SolveStep } from "../types";
import { findFish } from "./fish";

export function findXWing(state: LogicState): SolveStep | null {
  return findFish(state, 2, "x-wing", "X-Wing");
}
