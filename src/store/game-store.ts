import { create } from "zustand";
import {
  autoCandidates,
  bit,
  emptyGrid,
  emptyNotes,
  nextStep,
  notesAfterPlacement,
  type CellValue,
  type Difficulty,
  type Digit,
  type Grid,
  type SolveStep,
  type TechniqueId,
} from "@/engine";
import { playTone } from "@/lib/sound";
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useSettingsStore } from "@/store/settings-store";
import { useStatisticsStore } from "@/store/statistics-store";
import { useTimerStore } from "@/store/timer-store";

export type GameStatus = "idle" | "playing" | "paused" | "complete";
export type GameMode = "casual" | "daily" | "practice";

export interface HistoryCommand {
  index: number;
  previousValue: CellValue;
  nextValue: CellValue;
  previousNotes: number[];
  nextNotes: number[];
  previousMistakes: number;
  nextMistakes: number;
}

export type HintState =
  | { kind: "logical"; step: SolveStep; level: 1 | 2 | 3 | 4 }
  | { kind: "reveal"; index: number; digit: Digit };

interface PuzzlePayload {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  mode: GameMode;
  dailyDate: string | null;
  seed: number | null;
  recordStats: boolean;
  practiceTechnique?: TechniqueId | null;
}

interface PersistedGame extends PuzzlePayload {
  version: 1;
  gameId: string;
  entries: Grid;
  notes: number[];
  selected: number | null;
  notesMode: boolean;
  mistakes: number;
  hintsUsed: number;
  status: Exclude<GameStatus, "idle">;
  undoStack: HistoryCommand[];
  redoStack: HistoryCommand[];
  checked: boolean;
  finishedMs: number | null;
  elapsedMs: number;
}

interface GameStore extends PuzzlePayload {
  gameId: string | null;
  entries: Grid;
  notes: number[];
  selected: number | null;
  notesMode: boolean;
  mistakes: number;
  hintsUsed: number;
  status: GameStatus;
  undoStack: HistoryCommand[];
  redoStack: HistoryCommand[];
  checked: boolean;
  hint: HintState | null;
  finishedMs: number | null;
  practiceTechnique: TechniqueId | null;
  loadPuzzle: (payload: PuzzlePayload) => void;
  select: (index: number | null) => void;
  moveSelection: (rowStep: number, columnStep: number) => void;
  toggleNotesMode: () => void;
  inputDigit: (digit: Digit) => void;
  erase: () => void;
  undo: () => void;
  redo: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  clearNotes: () => void;
  toggleCheck: () => void;
  requestHint: () => void;
  setHintLevel: (level: 1 | 2 | 3 | 4) => void;
  revealHint: () => void;
  dismissHint: () => void;
  hydrate: () => void;
}

const EMPTY_PAYLOAD: PuzzlePayload = {
  puzzle: emptyGrid(),
  solution: emptyGrid(),
  difficulty: "easy",
  mode: "casual",
  dailyDate: null,
  seed: null,
  recordStats: false,
};

function sameGrid(left: Grid, right: Grid): boolean {
  for (let index = 0; index < 81; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `game-${Date.now()}`;
}

function persistNow() {
  const state = useGameStore.getState();
  if (state.status === "idle" || !state.gameId) {
    removeStorage(STORAGE_KEYS.game);
    return;
  }
  const payload: PersistedGame = {
    version: 1,
    gameId: state.gameId,
    puzzle: state.puzzle,
    solution: state.solution,
    entries: state.entries,
    notes: state.notes,
    selected: state.selected,
    notesMode: state.notesMode,
    difficulty: state.difficulty,
    mistakes: state.mistakes,
    hintsUsed: state.hintsUsed,
    status: state.status === "complete" ? "complete" : state.status === "paused" ? "paused" : "playing",
    undoStack: state.undoStack,
    redoStack: state.redoStack,
    checked: state.checked,
    mode: state.mode,
    dailyDate: state.dailyDate,
    seed: state.seed,
    recordStats: state.recordStats,
    practiceTechnique: state.practiceTechnique,
    finishedMs: state.finishedMs,
    elapsedMs: useTimerStore.getState().elapsedMs,
  };
  writeStorage(STORAGE_KEYS.game, payload);
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;

export function persistGameSoon(): void {
  if (typeof window === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => persistNow(), 300);
}

export function persistGameNow(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistNow();
}

function abandonIfNeeded() {
  const state = useGameStore.getState();
  if ((state.status === "playing" || state.status === "paused") && state.recordStats) {
    useStatisticsStore.getState().recordAbandon(state.difficulty);
  }
}

function finishGame() {
  const state = useGameStore.getState();
  if (state.status === "complete") return;
  const elapsed = useTimerStore.getState().elapsedMs;
  useTimerStore.getState().pause();
  useGameStore.setState({ status: "complete", finishedMs: elapsed, hint: null });
    if (state.recordStats) {
      useStatisticsStore.getState().recordCompletion({
        difficulty: state.difficulty,
        timeMs: elapsed,
        mistakes: state.mistakes,
        hints: state.hintsUsed,
        dailyDate: state.mode === "daily" ? state.dailyDate : null,
      });
    }
    playTone("complete");
  persistGameNow();
}

function pushHistory(command: HistoryCommand) {
  const undoStack = [...useGameStore.getState().undoStack, command].slice(-100);
  useGameStore.setState({ undoStack, redoStack: [] });
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...EMPTY_PAYLOAD,
  gameId: null,
  entries: emptyGrid(),
  notes: emptyNotes(),
  selected: null,
  notesMode: false,
  mistakes: 0,
  hintsUsed: 0,
  status: "idle",
  undoStack: [],
  redoStack: [],
  checked: false,
  hint: null,
  finishedMs: null,
  practiceTechnique: null,

  loadPuzzle: (payload) => {
    abandonIfNeeded();
    useTimerStore.getState().reset(0);
    useTimerStore.getState().start();
    set({
      ...payload,
      practiceTechnique: payload.practiceTechnique ?? null,
      gameId: newId(),
      entries: payload.puzzle.slice(),
      notes: emptyNotes(),
      selected: null,
      notesMode: false,
      mistakes: 0,
      hintsUsed: 0,
      status: "playing",
      undoStack: [],
      redoStack: [],
      checked: false,
      hint: null,
      finishedMs: null,
    });
    persistGameNow();
  },

  select: (index) => {
    if (get().status === "idle") return;
    set({ selected: index });
  },

  moveSelection: (rowStep, columnStep) => {
    const current = get().selected;
    const start = current ?? 0;
    const row = Math.min(8, Math.max(0, Math.floor(start / 9) + rowStep));
    const column = Math.min(8, Math.max(0, (start % 9) + columnStep));
    set({ selected: row * 9 + column });
  },

  toggleNotesMode: () => {
    if (useSettingsStore.getState().autoCandidates) return;
    set({ notesMode: !get().notesMode });
  },

  inputDigit: (digit) => {
    const state = get();
    if (state.status !== "playing" || state.selected == null) return;
    const index = state.selected;
    if (state.puzzle[index] !== 0) return;

    if (state.notesMode && !useSettingsStore.getState().autoCandidates) {
      const previousNotes = state.notes.slice();
      const nextNotes = state.notes.slice();
      const flag = bit(digit);
      nextNotes[index] = nextNotes[index] & flag ? nextNotes[index] & ~flag : nextNotes[index] | flag;
      pushHistory({
        index,
        previousValue: state.entries[index],
        nextValue: state.entries[index],
        previousNotes,
        nextNotes,
        previousMistakes: state.mistakes,
        nextMistakes: state.mistakes,
      });
      set({ notes: nextNotes, hint: null });
      persistGameSoon();
      return;
    }

    if (state.entries[index] === digit) return;
    const previousNotes = state.notes.slice();
    const nextNotes = notesAfterPlacement(state.notes, index, digit);
    const entries = state.entries.slice();
    entries[index] = digit;
    const wrong = digit !== state.solution[index];
    const countMistakes = useSettingsStore.getState().mistakeCounting && wrong;
    const mistakes = state.mistakes + (countMistakes ? 1 : 0);
    pushHistory({
      index,
      previousValue: state.entries[index],
      nextValue: digit,
      previousNotes,
      nextNotes,
      previousMistakes: state.mistakes,
      nextMistakes: mistakes,
    });
    set({ entries, notes: nextNotes, mistakes, hint: null });
    if (sameGrid(entries, state.solution)) finishGame();
    else {
      playTone(wrong ? "conflict" : "place");
      persistGameSoon();
    }
  },

  erase: () => {
    const state = get();
    if (state.status !== "playing" || state.selected == null) return;
    const index = state.selected;
    if (state.puzzle[index] !== 0) return;
    if (state.entries[index] === 0 && state.notes[index] === 0) return;
    const previousNotes = state.notes.slice();
    const nextNotes = state.notes.slice();
    nextNotes[index] = 0;
    const entries = state.entries.slice();
    entries[index] = 0;
    pushHistory({
      index,
      previousValue: state.entries[index],
      nextValue: 0,
      previousNotes,
      nextNotes,
      previousMistakes: state.mistakes,
      nextMistakes: state.mistakes,
    });
    set({ entries, notes: nextNotes, hint: null });
    persistGameSoon();
  },

  undo: () => {
    const state = get();
    if (state.status !== "playing" || state.undoStack.length === 0) return;
    const command = state.undoStack[state.undoStack.length - 1];
    const entries = state.entries.slice();
    if (command.index >= 0) entries[command.index] = command.previousValue;
    set({
      entries,
      notes: command.previousNotes.slice(),
      mistakes: command.previousMistakes,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, command],
      hint: null,
      selected: command.index >= 0 ? command.index : state.selected,
    });
    persistGameSoon();
  },

  redo: () => {
    const state = get();
    if (state.status !== "playing" || state.redoStack.length === 0) return;
    const command = state.redoStack[state.redoStack.length - 1];
    const entries = state.entries.slice();
    if (command.index >= 0) entries[command.index] = command.nextValue;
    set({
      entries,
      notes: command.nextNotes.slice(),
      mistakes: command.nextMistakes,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, command],
      hint: null,
      selected: command.index >= 0 ? command.index : state.selected,
    });
    if (sameGrid(entries, state.solution)) finishGame();
    else persistGameSoon();
  },

  pause: () => {
    if (get().status !== "playing") return;
    useTimerStore.getState().pause();
    set({ status: "paused" });
    persistGameNow();
  },

  resume: () => {
    if (get().status !== "paused") return;
    useTimerStore.getState().start();
    set({ status: "playing" });
    persistGameNow();
  },

  restart: () => {
    const state = get();
    if (state.status === "idle") return;
    useTimerStore.getState().reset(0);
    useTimerStore.getState().start();
    set({
      gameId: newId(),
      entries: state.puzzle.slice(),
      notes: emptyNotes(),
      mistakes: 0,
      hintsUsed: 0,
      status: "playing",
      undoStack: [],
      redoStack: [],
      checked: false,
      hint: null,
      finishedMs: null,
      selected: null,
    });
    persistGameNow();
  },

  clearNotes: () => {
    const state = get();
    if (state.status !== "playing") return;
    if (state.notes.every((mask) => mask === 0)) return;
    pushHistory({
      index: -1,
      previousValue: 0,
      nextValue: 0,
      previousNotes: state.notes.slice(),
      nextNotes: emptyNotes(),
      previousMistakes: state.mistakes,
      nextMistakes: state.mistakes,
    });
    set({ notes: emptyNotes(), hint: null });
    persistGameSoon();
  },

  toggleCheck: () => set({ checked: !get().checked }),

  requestHint: () => {
    const state = get();
    if (state.status !== "playing") return;
    const step = nextStep(state.entries);
    if (step) {
      set({ hint: { kind: "logical", step, level: 1 }, hintsUsed: state.hintsUsed + 1 });
      playTone("hint");
      persistGameSoon();
      return;
    }
    for (let index = 0; index < 81; index += 1) {
      if (state.entries[index] !== state.solution[index] && state.solution[index] !== 0) {
        set({
          hint: { kind: "reveal", index, digit: state.solution[index] as Digit },
          hintsUsed: state.hintsUsed + 1,
          selected: index,
        });
        playTone("hint");
        persistGameSoon();
        return;
      }
    }
  },

  setHintLevel: (level) => {
    const hint = get().hint;
    if (!hint || hint.kind !== "logical") return;
    set({ hint: { ...hint, level } });
  },

  revealHint: () => {
    const state = get();
    const hint = state.hint;
    if (!hint || state.status !== "playing") return;
    if (hint.kind === "reveal") {
      set({ selected: hint.index });
      get().inputDigit(hint.digit);
      return;
    }
    const placement = hint.step.placements?.[0];
    if (placement) {
      set({ selected: placement.index, notesMode: false });
      get().inputDigit(placement.digit);
      return;
    }
    const notes = state.notes.slice();
    const derived = autoCandidates(state.entries);
    for (const elimination of hint.step.eliminations ?? []) {
      const base = notes[elimination.index] || derived[elimination.index];
      notes[elimination.index] = base & ~bit(elimination.digit);
    }
    const previousNotes = state.notes.slice();
    pushHistory({
      index: -1,
      previousValue: 0,
      nextValue: 0,
      previousNotes,
      nextNotes: notes,
      previousMistakes: state.mistakes,
      nextMistakes: state.mistakes,
    });
    set({ notes, hint: null });
    persistGameSoon();
  },

  dismissHint: () => set({ hint: null }),

  hydrate: () => {
    const stored = readStorage<PersistedGame>(STORAGE_KEYS.game);
    if (!stored || stored.version !== 1 || !stored.puzzle || stored.puzzle.length !== 81) return;
    set({
      gameId: stored.gameId,
      puzzle: stored.puzzle,
      solution: stored.solution,
      entries: stored.entries,
      notes: stored.notes,
      selected: stored.selected,
      notesMode: stored.notesMode,
      difficulty: stored.difficulty,
      mistakes: stored.mistakes,
      hintsUsed: stored.hintsUsed,
      status: stored.status,
      undoStack: stored.undoStack ?? [],
      redoStack: stored.redoStack ?? [],
      checked: stored.checked ?? false,
      hint: null,
      mode: stored.mode,
      dailyDate: stored.dailyDate,
      seed: stored.seed,
      recordStats: stored.recordStats,
      practiceTechnique: stored.practiceTechnique ?? null,
      finishedMs: stored.finishedMs,
    });
    useTimerStore.getState().reset(stored.elapsedMs ?? 0);
    if (stored.status === "playing") useTimerStore.getState().start();
  },
}));
