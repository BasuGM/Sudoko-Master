import { create } from "zustand";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export type ThemeName = "light" | "dark";
export type BoardTheme = "paper" | "night" | "graphite";
export type AccentName = "teal" | "indigo" | "copper";
export type BoardSize = "small" | "medium" | "large";

export interface SettingsData {
  version: 1;
  theme: ThemeName;
  boardTheme: BoardTheme;
  accent: AccentName;
  boardSize: BoardSize;
  sound: boolean;
  motion: boolean;
  autoCheck: boolean;
  mistakeCounting: boolean;
  autoCandidates: boolean;
}

export const defaultSettings: SettingsData = {
  version: 1,
  theme: "light",
  boardTheme: "paper",
  accent: "teal",
  boardSize: "medium",
  sound: false,
  motion: true,
  autoCheck: true,
  mistakeCounting: true,
  autoCandidates: false,
};

interface SettingsStore extends SettingsData {
  hydrate: () => void;
  update: (patch: Partial<Omit<SettingsData, "version">>) => void;
}

function persist(state: SettingsData) {
  writeStorage(STORAGE_KEYS.settings, state);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  hydrate: () => {
    const stored = readStorage<SettingsData>(STORAGE_KEYS.settings);
    if (!stored || stored.version !== 1) return;
    set({ ...defaultSettings, ...stored, version: 1 });
  },
  update: (patch) => {
    set(patch);
    const state = get();
    persist({
      version: 1,
      theme: state.theme,
      boardTheme: state.boardTheme,
      accent: state.accent,
      boardSize: state.boardSize,
      sound: state.sound,
      motion: state.motion,
      autoCheck: state.autoCheck,
      mistakeCounting: state.mistakeCounting,
      autoCandidates: state.autoCandidates,
    });
  },
}));
