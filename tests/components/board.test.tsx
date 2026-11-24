// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { generateSolution, mulberry32 } from "@/engine";
import { SudokuBoard } from "@/components/board/SudokuBoard";
import { useReadyStore } from "@/components/layout/AppProvider";
import { GameScreen } from "@/components/game/GameScreen";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGameStore } from "@/store/game-store";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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

  it("selects a cell when it receives keyboard focus", () => {
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
    screen.getByRole("gridcell", { name: /row 1, column 2, empty/i }).focus();
    expect(onSelect).toHaveBeenCalledWith(1);
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

  it("does not type into the board while the new-puzzle dialog is open", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <GameScreen />
      </TooltipProvider>,
    );
    await user.click(screen.getByRole("gridcell", { name: /row 1, column 1, empty/i }));
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("4");
    expect(useGameStore.getState().entries[0]).toBe(0);
  });

  it("leaves the daily screen when a new casual puzzle starts", async () => {
    useGameStore.getState().loadPuzzle({
      puzzle,
      solution,
      difficulty: "medium",
      mode: "daily",
      dailyDate: "2026-11-24",
      seed: 8,
      recordStats: false,
    });
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <GameScreen />
      </TooltipProvider>,
    );
    push.mockClear();
    await user.click(screen.getByRole("button", { name: "New" }));
    await user.click(screen.getByRole("button", { name: /easy/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/game"));
    expect(useGameStore.getState().mode).toBe("casual");
    expect(useGameStore.getState().status).toBe("playing");
  });
});
