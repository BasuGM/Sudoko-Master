export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CellValue = 0 | Digit;

/** 81 cells, row-major. 0 is empty. */
export type Grid = CellValue[];

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type TechniqueId =
  | "naked-single"
  | "hidden-single"
  | "naked-pair"
  | "hidden-pair"
  | "pointing-pair"
  | "box-line-reduction"
  | "naked-triple"
  | "hidden-triple"
  | "x-wing"
  | "swordfish"
  | "xy-wing";

export interface Placement {
  index: number;
  digit: Digit;
}

export interface Elimination {
  index: number;
  digit: Digit;
}

export interface SolveStep {
  technique: TechniqueId;
  explanation: string;
  /** Cells to highlight: the pattern and any cells that change. */
  cells: number[];
  placements?: Placement[];
  eliminations?: Elimination[];
}

export interface LogicState {
  grid: Grid;
  /** 9-bit candidate masks. Bit 0 is digit 1. Filled cells use 0. */
  candidates: number[];
}

export interface GeneratedPuzzle {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  seed: number;
}

export const TECHNIQUE_NAMES: Record<TechniqueId, string> = {
  "naked-single": "Naked single",
  "hidden-single": "Hidden single",
  "naked-pair": "Naked pair",
  "hidden-pair": "Hidden pair",
  "pointing-pair": "Pointing pair",
  "box-line-reduction": "Box/line reduction",
  "naked-triple": "Naked triple",
  "hidden-triple": "Hidden triple",
  "x-wing": "X-Wing",
  swordfish: "Swordfish",
  "xy-wing": "XY-Wing",
};
