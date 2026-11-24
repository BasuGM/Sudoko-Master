"use client";

import { useEffect, type ReactNode } from "react";
import { create } from "zustand";
import { persistGameNow, useGameStore } from "@/store/game-store";
import { useSettingsStore } from "@/store/settings-store";
import { useStatisticsStore } from "@/store/statistics-store";
import { useTimerStore } from "@/store/timer-store";

export const useReadyStore = create<{ ready: boolean }>(() => ({ ready: false }));

function applyAppearance() {
  const settings = useSettingsStore.getState();
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.dataset.theme = settings.theme;
  root.dataset.board = settings.boardTheme;
  root.dataset.accent = settings.accent;
  root.dataset.boardSize = settings.boardSize;
  root.dataset.motion = settings.motion && !reduce ? "on" : "off";
}

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useSettingsStore.getState().hydrate();
    useStatisticsStore.getState().hydrate();
    useGameStore.getState().hydrate();
    applyAppearance();
    useReadyStore.setState({ ready: true });

    const onHide = () => persistGameNow();
    const interval = window.setInterval(() => useTimerStore.getState().tick(), 250);
    const unsubscribe = useSettingsStore.subscribe(applyAppearance);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onHide);
      unsubscribe();
    };
  }, []);

  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}

export function useAppReady(): boolean {
  return useReadyStore((state) => state.ready);
}
