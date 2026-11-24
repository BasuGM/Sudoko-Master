import { generatePuzzle, type Difficulty, type GeneratedPuzzle } from "@/engine";
import { randomSeed } from "@/engine/random";

export function createPuzzle(difficulty: Difficulty, seed = randomSeed()): Promise<GeneratedPuzzle> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve(generatePuzzle(difficulty, seed));
  }

  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("../engine/worker.ts", import.meta.url));
    } catch (error) {
      try {
        resolve(generatePuzzle(difficulty, seed));
      } catch (cause) {
        reject(cause instanceof Error ? cause : error);
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      worker.terminate();
      try {
        resolve(generatePuzzle(difficulty, seed));
      } catch (cause) {
        reject(cause);
      }
    }, 20000);

    worker.onmessage = (event: MessageEvent<GeneratedPuzzle | { error: string }>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      if ("error" in event.data) {
        reject(new Error(event.data.error));
        return;
      }
      resolve(event.data);
    };
    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      try {
        resolve(generatePuzzle(difficulty, seed));
      } catch (cause) {
        reject(cause);
      }
    };
    worker.postMessage({ difficulty, seed });
  });
}
