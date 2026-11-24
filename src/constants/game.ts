import type { Difficulty } from "@/engine";

export const DIFFICULTIES: { id: Difficulty; label: string; blurb: string }[] = [
  { id: "easy", label: "Easy", blurb: "Singles" },
  { id: "medium", label: "Medium", blurb: "Pairs and reductions" },
  { id: "hard", label: "Hard", blurb: "Triples and X-Wings" },
  { id: "expert", label: "Expert", blurb: "Chains and swordfish" },
];

export function difficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTIES.find((item) => item.id === difficulty)?.label ?? difficulty;
}
