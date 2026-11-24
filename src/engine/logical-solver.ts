import { bit } from "./mask";
import { PEERS } from "./grid";
import { autoCandidates } from "./candidates";
import { isSolved } from "./validator";
import type { Grid, LogicState, SolveStep } from "./types";
import { findNakedSingles } from "./techniques/naked-singles";
import { findHiddenSingles } from "./techniques/hidden-singles";
import { findNakedPairs } from "./techniques/naked-pairs";
import { findHiddenPairs } from "./techniques/hidden-pairs";
import { findPointingPairs } from "./techniques/pointing-pairs";
import { findBoxLineReductions } from "./techniques/box-line-reduction";
import { findNakedTriples } from "./techniques/naked-triples";
import { findHiddenTriples } from "./techniques/hidden-triples";
import { findXWing } from "./techniques/x-wing";
import { findSwordfish } from "./techniques/swordfish";
import { findXYWing } from "./techniques/xy-wing";

const FINDERS = [
  findNakedSingles,
  findHiddenSingles,
  findNakedPairs,
  findHiddenPairs,
  findPointingPairs,
  findBoxLineReductions,
  findNakedTriples,
  findHiddenTriples,
  findXWing,
  findSwordfish,
  findXYWing,
];

export function createState(grid: Grid): LogicState {
  return {
    grid: grid.slice(),
    candidates: autoCandidates(grid),
  };
}

export function findNextStep(state: LogicState): SolveStep | null {
  for (const find of FINDERS) {
    const step = find(state);
    if (step) return step;
  }
  return null;
}

export function applyStep(state: LogicState, step: SolveStep): void {
  for (const placement of step.placements ?? []) {
    state.grid[placement.index] = placement.digit;
    state.candidates[placement.index] = 0;
    const flag = bit(placement.digit);
    for (const peer of PEERS[placement.index]) state.candidates[peer] &= ~flag;
  }
  for (const elimination of step.eliminations ?? []) {
    state.candidates[elimination.index] &= ~bit(elimination.digit);
  }
}

export interface LogicalResult {
  solved: boolean;
  steps: SolveStep[];
  grid: Grid;
  frames: Grid[];
  candidateFrames: number[][];
}

export function logicalSolve(grid: Grid, trace = false): LogicalResult {
  const state = createState(grid);
  const steps: SolveStep[] = [];
  const frames: Grid[] = trace ? [grid.slice()] : [];
  const candidateFrames: number[][] = trace ? [state.candidates.slice()] : [];

  for (let guard = 0; guard < 200; guard += 1) {
    if (isSolved(state.grid)) {
      return {
        solved: true,
        steps,
        grid: state.grid.slice(),
        frames,
        candidateFrames,
      };
    }
    if (state.grid.some((value, index) => value === 0 && state.candidates[index] === 0)) break;
    const step = findNextStep(state);
    if (!step) break;
    applyStep(state, step);
    steps.push(step);
    if (trace) {
      frames.push(state.grid.slice());
      candidateFrames.push(state.candidates.slice());
    }
  }

  return {
    solved: isSolved(state.grid),
    steps,
    grid: state.grid.slice(),
    frames,
    candidateFrames,
  };
}

export function nextStep(grid: Grid): SolveStep | null {
  return findNextStep(createState(grid));
}
