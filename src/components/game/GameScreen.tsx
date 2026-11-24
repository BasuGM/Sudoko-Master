"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { autoCandidates, conflictIndexes, TECHNIQUE_NAMES, type Difficulty } from "@/engine";
import { SudokuBoard } from "@/components/board/SudokuBoard";
import { flagList, peerFlags, sameNumberFlags } from "@/components/board/highlights";
import { GameToolbar } from "@/components/controls/GameToolbar";
import { NumberPad } from "@/components/controls/NumberPad";
import { GameTimer } from "@/components/game/GameTimer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DIFFICULTIES, difficultyLabel } from "@/constants/game";
import { useAppReady } from "@/components/layout/AppProvider";
import { useGameKeyboard } from "@/hooks/use-game-keyboard";
import { createPuzzle } from "@/lib/create-puzzle";
import { formatDuration } from "@/lib/time";
import { useGameStore } from "@/store/game-store";
import { useSettingsStore } from "@/store/settings-store";

export function GameScreen() {
  const router = useRouter();
  const reduce = useReducedMotion();
  useGameKeyboard();
  const status = useGameStore((state) => state.status);
  const entries = useGameStore((state) => state.entries);
  const puzzle = useGameStore((state) => state.puzzle);
  const solution = useGameStore((state) => state.solution);
  const notes = useGameStore((state) => state.notes);
  const selected = useGameStore((state) => state.selected);
  const notesMode = useGameStore((state) => state.notesMode);
  const difficulty = useGameStore((state) => state.difficulty);
  const mistakes = useGameStore((state) => state.mistakes);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const checked = useGameStore((state) => state.checked);
  const hint = useGameStore((state) => state.hint);
  const finishedMs = useGameStore((state) => state.finishedMs);
  const mode = useGameStore((state) => state.mode);
  const undoLength = useGameStore((state) => state.undoStack.length);
  const redoLength = useGameStore((state) => state.redoStack.length);
  const autoCheck = useSettingsStore((state) => state.autoCheck);
  const mistakeCounting = useSettingsStore((state) => state.mistakeCounting);
  const autoCandidateSetting = useSettingsStore((state) => state.autoCandidates);
  const motionOn = useSettingsStore((state) => state.motion);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<Difficulty | null>(null);
  const [error, setError] = useState("");
  const [victoryOpen, setVictoryOpen] = useState(true);
  const ready = useAppReady();

  const givens = useMemo(() => puzzle.map((value) => value !== 0), [puzzle]);
  const peers = useMemo(() => peerFlags(selected), [selected]);
  const same = useMemo(() => sameNumberFlags(entries, selected), [entries, selected]);
  const showErrors = autoCheck || checked;
  const conflictFlags = useMemo(() => {
    const flags = Array<boolean>(81).fill(false);
    if (!showErrors) return flags;
    for (const index of conflictIndexes(entries)) flags[index] = true;
    return flags;
  }, [entries, showErrors]);
  const wrong = useMemo(() => {
    return entries.map((value, index) => showErrors && !givens[index] && value !== 0 && value !== solution[index]);
  }, [entries, givens, showErrors, solution]);
  const emphasis = useMemo(() => {
    if (!hint) return Array<boolean>(81).fill(false);
    if (hint.kind === "reveal") return flagList([hint.index]);
    const primary = hint.step.placements?.[0]?.index ?? hint.step.eliminations?.[0]?.index ?? hint.step.cells[0] ?? -1;
    return flagList(hint.level >= 3 ? hint.step.cells : [primary]);
  }, [hint]);
  const derived = useMemo(() => autoCandidates(entries), [entries]);
  const displayNotes = useMemo(() => {
    return entries.map((value, index) => {
      if (value !== 0) return 0;
      if (hint?.kind === "logical" && hint.level >= 4 && emphasis[index]) return derived[index] ?? 0;
      if (autoCandidateSetting) return derived[index] ?? 0;
      return notes[index] ?? 0;
    });
  }, [autoCandidateSetting, derived, emphasis, entries, hint, notes]);
  const counts = useMemo(() => {
    const tally = Array<number>(10).fill(0);
    for (const value of entries) if (value) tally[value] += 1;
    return tally;
  }, [entries]);

  async function start(next: Difficulty) {
    setPending(next);
    setError("");
    try {
      const generated = await createPuzzle(next);
      useGameStore.getState().loadPuzzle({
        puzzle: generated.puzzle,
        solution: generated.solution,
        difficulty: generated.difficulty,
        mode: "casual",
        dailyDate: null,
        seed: generated.seed,
        recordStats: true,
      });
      setMenuOpen(false);
      setVictoryOpen(true);
      router.push("/game");
    } catch {
      setError("A puzzle didn't settle. Try once more.");
    } finally {
      setPending(null);
    }
  }

  if (!ready) {
    return <div className="sudoku-board mx-auto" aria-hidden />;
  }

  if (status === "idle") {
    return (
      <section className="mx-auto max-w-md">
        <p className="text-sm text-muted">New game</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Choose a difficulty.</h1>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {DIFFICULTIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-baseline justify-between py-4 text-left"
              disabled={pending !== null}
              onClick={() => void start(item.id)}
            >
              <span className="text-lg">{item.label}</span>
              <span className="text-sm text-muted">{pending === item.id ? "Composing" : item.blurb}</span>
            </button>
          ))}
        </div>
        {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      </section>
    );
  }

  const playing = status === "playing";
  const animate = motionOn && !reduce;

  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col">
      <header className="mb-5 grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-1">
        <p className="text-sm text-muted">{mode === "daily" ? "Daily" : difficultyLabel(difficulty)}</p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={status === "complete"}
            onClick={() => (playing ? useGameStore.getState().pause() : useGameStore.getState().resume())}
          >
            {status === "paused" ? "Resume" : "Pause"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setMenuOpen(true)}>
            New
          </Button>
        </div>
        <p className="font-display text-4xl leading-none">
          <GameTimer />
        </p>
        <p className="pb-1 text-right text-sm text-muted">
          {mistakeCounting ? `${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}` : "Practice marks off"}
        </p>
      </header>

      <div className="relative mx-auto w-full">
        <SudokuBoard
          entries={entries}
          givens={givens}
          notes={displayNotes}
          selected={status === "paused" ? null : selected}
          peers={status === "paused" ? Array(81).fill(false) : peers}
          same={status === "paused" ? Array(81).fill(false) : same}
          conflicts={conflictFlags}
          wrong={wrong}
          emphasis={status === "paused" ? Array(81).fill(false) : emphasis}
          readOnly={!playing}
          onSelect={(index) => useGameStore.getState().select(index)}
        />
        {status === "paused" ? (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--board-paper)] text-[var(--board-given)]"
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
          >
            <p className="font-display text-4xl">Paused</p>
            <Button type="button" variant="solid" onClick={() => useGameStore.getState().resume()}>
              Resume
            </Button>
          </motion.div>
        ) : null}
      </div>

      {hint && status === "playing" ? (
        <aside aria-label="Hint" className="mt-4 border border-line px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            {hint.kind === "logical" ? TECHNIQUE_NAMES[hint.step.technique] : "Reveal"}
          </p>
          {hint.kind === "reveal" ? (
            <p className="mt-2 text-sm leading-6">
              No listed technique settles a cell from here. You can still reveal one digit.
            </p>
          ) : hint.level >= 2 ? (
            <p className="mt-2 text-sm leading-6">{hint.step.explanation}</p>
          ) : (
            <p className="mt-2 text-sm leading-6">A cell is marked. Ask for the reasoning when you want it.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {hint.kind === "logical" && hint.level < 2 ? (
              <button type="button" className="underline decoration-line underline-offset-4" onClick={() => useGameStore.getState().setHintLevel(2)}>
                Explain
              </button>
            ) : null}
            {hint.kind === "logical" && hint.level < 3 ? (
              <button type="button" className="underline decoration-line underline-offset-4" onClick={() => useGameStore.getState().setHintLevel(3)}>
                Show cells
              </button>
            ) : null}
            {hint.kind === "logical" && hint.level < 4 ? (
              <button type="button" className="underline decoration-line underline-offset-4" onClick={() => useGameStore.getState().setHintLevel(4)}>
                Candidates
              </button>
            ) : null}
            <button type="button" className="underline decoration-line underline-offset-4" onClick={() => useGameStore.getState().revealHint()}>
              Reveal digit
            </button>
            <button type="button" className="text-muted" onClick={() => useGameStore.getState().dismissHint()}>
              Dismiss
            </button>
          </div>
        </aside>
      ) : null}

      <div className="mt-4">
        <GameToolbar
          notesMode={notesMode}
          notesDisabled={autoCandidateSetting}
          disabled={!playing}
          canUndo={undoLength > 0}
          canRedo={redoLength > 0}
          onUndo={() => useGameStore.getState().undo()}
          onRedo={() => useGameStore.getState().redo()}
          onErase={() => useGameStore.getState().erase()}
          onNotes={() => useGameStore.getState().toggleNotesMode()}
          onHint={() => useGameStore.getState().requestHint()}
        />
      </div>
      <div className="mt-3">
        <NumberPad
          counts={counts}
          disabled={!playing}
          onDigit={(digit) => useGameStore.getState().inputDigit(digit)}
        />
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm text-muted">
        <button type="button" onClick={() => useGameStore.getState().toggleCheck()} disabled={!playing}>
          {checked ? "Hide check" : "Check"}
        </button>
        <button type="button" onClick={() => useGameStore.getState().restart()}>
          Restart
        </button>
        <button type="button" onClick={() => useGameStore.getState().clearNotes()} disabled={!playing}>
          Clear notes
        </button>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent>
          <DialogTitle>New puzzle</DialogTitle>
          <DialogDescription>The current game is kept in your statistics if you leave it unfinished.</DialogDescription>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {DIFFICULTIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-baseline justify-between py-3 text-left"
                disabled={pending !== null}
                onClick={() => void start(item.id)}
              >
                <span>{item.label}</span>
                <span className="text-sm text-muted">{pending === item.id ? "Composing" : item.blurb}</span>
              </button>
            ))}
          </div>
          {error ? <p className="mt-3 text-sm text-muted">{error}</p> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={status === "complete" && victoryOpen} onOpenChange={setVictoryOpen}>
        <DialogContent>
          <DialogTitle>Puzzle complete</DialogTitle>
          <DialogDescription>
            {formatDuration(finishedMs ?? 0)}
            {mistakeCounting ? ` · ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}` : ""}
            {` · ${hintsUsed} ${hintsUsed === 1 ? "hint" : "hints"}`}
          </DialogDescription>
          <div className="mt-6 flex gap-3">
            <Button type="button" variant="solid" onClick={() => void start(difficulty)}>
              Play again
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/daily")}>
              Daily
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
