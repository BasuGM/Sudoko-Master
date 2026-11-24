// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { generateSolution, mulberry32 } from "@/engine";
import { SudokuBoard } from "@/components/board/SudokuBoard";
import { useReadyStore } from "@/components/layout/AppProvider";
import { GameScreen } from "@/components/game/GameScreen";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGameStore } from "@/store/game-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/game",
}));

const flags = Array<boolean>(81).fill(false);

afterEach(() => cleanup());

describe("board", () => {
  it("selects a cell", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SudokuBoard
        entries={Array<number>(81).fill(0)}
        givens={flags}
        notes={Array<number>(81).fill(0)}
        selected={null}
        peers={flags}
        same={flags}
        conflicts={flags}
        wrong={flags}
        emphasis={flags}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole("gridcell", { name: /row 1, column 1, empty/i }));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});

describe("game screen input", () => {
  const solution = generateSolution(mulberry32(8));
  const puzzle = solution.slice();
  puzzle[0] = 0;
  puzzle[1] = 0;

  beforeEach(() => {
    useReadyStore.setState({ ready: true });
    useGameStore.getState().loadPuzzle({
      puzzle,
      solution,
      difficulty: "easy",
      mode: "casual",
      dailyDate: null,
      seed: 8,
      recordStats: false,
    });
  });

  it("enters a number, a note, and undoes from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <GameScreen />
      </TooltipProvider>,
    );
    const cell = screen.getByRole("gridcell", { name: /row 1, column 1, empty/i });
    await user.click(cell);
    await user.keyboard("5");
    expect(screen.getByRole("gridcell", { name: /row 1, column 1, entered 5/i })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("gridcell", { name: /row 1, column 2/i })).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("button", { name: "Notes" }));
    await user.keyboard("3");
    expect(screen.getByRole("gridcell", { name: /row 1, column 2, empty/i })).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("gridcell", { name: /row 1, column 2, empty/i })).not.toHaveTextContent("3");
  });
});
