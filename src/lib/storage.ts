const GAME_KEY = "sudoku-master:game:v1";
const SETTINGS_KEY = "sudoku-master:settings:v1";
const STATS_KEY = "sudoku-master:stats:v1";

export const STORAGE_KEYS = { game: GAME_KEY, settings: SETTINGS_KEY, stats: STATS_KEY };

export function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota should not interrupt the game in memory.
  }
}

export function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}
