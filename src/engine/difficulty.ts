import type { Difficulty, SolveStep, TechniqueId } from "./types";

const RANK: Record<TechniqueId, number> = {
  "naked-single": 1,
  "hidden-single": 2,
  "naked-pair": 3,
  "hidden-pair": 4,
  "pointing-pair": 5,
  "box-line-reduction": 6,
  "naked-triple": 7,
  "hidden-triple": 7,
  "x-wing": 8,
  swordfish: 9,
  "xy-wing": 9,
};

const BAND: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export function techniqueRank(technique: TechniqueId): number {
  return RANK[technique];
}

export function difficultyRank(difficulty: Difficulty): number {
  return BAND[difficulty];
}

/**
 * Rate a finished logical solve.
 * Easy is singles. Medium reaches pairs, pointing, or box/line.
 * Hard reaches triples or X-Wing. Expert is swordfish, or three or more hard steps.
 */
export function classifyDifficulty(steps: SolveStep[], solved: boolean): Difficulty | null {
  if (!solved) return null;
  if (steps.length === 0) return "easy";

  let hardest = 0;
  let hardSteps = 0;
  for (const step of steps) {
    const rank = RANK[step.technique];
    if (rank > hardest) hardest = rank;
    if (rank >= RANK["naked-triple"]) hardSteps += 1;
  }

  if (hardest <= RANK["hidden-single"]) return "easy";
  if (hardest <= RANK["box-line-reduction"]) return "medium";
  if (hardest <= RANK["x-wing"] && hardSteps < 3) return "hard";
  return "expert";
}
