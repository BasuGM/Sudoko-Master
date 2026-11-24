import { generatePuzzle } from "./generator";
import type { Difficulty } from "./types";

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<{ difficulty: Difficulty; seed: number }>) => void) | null;
  postMessage: (data: unknown) => void;
};

scope.onmessage = (event) => {
  try {
    scope.postMessage(generatePuzzle(event.data.difficulty, event.data.seed));
  } catch (error) {
    scope.postMessage({
      error: error instanceof Error ? error.message : "Could not compose a puzzle.",
    });
  }
};
