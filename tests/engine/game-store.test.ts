import { beforeEach, describe, expect, it } from "vitest";
import { generateSolution, mulberry32, type Digit } from "@/engine";
import { useGameStore } from "@/store/game-store";

describe("game history", () => {
  const solution = generateSolution(mulberry32(4));
  const puzzle = solution.slice();
  puzzle[0] = 0;
  puzzle[1] = 0;

  beforeEach(() => {
    useGameStore.getState().loadPuzzle({
      puzzle,
      solution,
      difficulty: "easy",
      mode: "casual",
      dailyDate: null,
      seed: 4,
      recordStats: false,
    });
  });

  it("enters a digit and restores it with undo and redo", () => {
    const store = useGameStore.getState();
    store.select(0);
    store.inputDigit(solution[0] as Digit);
    expect(useGameStore.getState().entries[0]).toBe(solution[0]);
    useGameStore.getState().undo();
    expect(useGameStore.getState().entries[0]).toBe(0);
    useGameStore.getState().redo();
    expect(useGameStore.getState().entries[0]).toBe(solution[0]);
  });

  it("toggles a note and restores it", () => {
    useGameStore.getState().select(1);
    useGameStore.getState().toggleNotesMode();
    useGameStore.getState().inputDigit(3);
    expect(useGameStore.getState().notes[1] & (1 << 2)).toBeGreaterThan(0);
    useGameStore.getState().undo();
    expect(useGameStore.getState().notes[1]).toBe(0);
  });

  it("moves the selection with arrows", () => {
    useGameStore.getState().select(0);
    useGameStore.getState().moveSelection(0, 1);
    expect(useGameStore.getState().selected).toBe(1);
    useGameStore.getState().moveSelection(1, 0);
    expect(useGameStore.getState().selected).toBe(10);
  });
});
