import {
  classifyDifficulty,
  countSolutions,
  logicalSolve,
  parsePuzzle,
  solve,
  type Difficulty,
  type Grid,
} from "@/engine";

export type ImportResult =
  | { ok: true; puzzle: Grid; solution: Grid; difficulty: Difficulty }
  | { ok: false; error: string };

export function importPuzzle(raw: string): ImportResult {
  const parsed = parsePuzzle(raw);
  if (!parsed.ok) return parsed;
  const count = countSolutions(parsed.grid, 2);
  if (count !== 1) {
    return {
      ok: false,
      error: count === 0 ? "This puzzle has no solution." : "This puzzle has more than one solution.",
    };
  }
  const solution = solve(parsed.grid);
  if (!solution) return { ok: false, error: "This puzzle has no solution." };
  const logical = logicalSolve(parsed.grid);
  const difficulty = (logical.solved && classifyDifficulty(logical.steps, true)) || "expert";
  return { ok: true, puzzle: parsed.grid, solution, difficulty };
}
