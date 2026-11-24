import { create } from "zustand";

interface TimerStore {
  elapsedMs: number;
  running: boolean;
  lastTick: number;
  start: () => void;
  pause: () => void;
  reset: (elapsedMs?: number) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  elapsedMs: 0,
  running: false,
  lastTick: 0,
  start: () => {
    if (get().running) return;
    set({ running: true, lastTick: Date.now() });
  },
  pause: () => set({ running: false }),
  reset: (elapsedMs = 0) => set({ elapsedMs, running: false, lastTick: Date.now() }),
  tick: () => {
    const state = get();
    if (!state.running) return;
    const now = Date.now();
    set({ elapsedMs: state.elapsedMs + (now - state.lastTick), lastTick: now });
  },
}));
