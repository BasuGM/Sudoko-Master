"use client";

import { useEffect } from "react";
import type { Digit } from "@/engine";
import { useGameStore } from "@/store/game-store";

export function useGameKeyboard() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const store = useGameStore.getState();
      const key = event.key;

      if (key === "p" || key === "P") {
        event.preventDefault();
        if (store.status === "playing") store.pause();
        else if (store.status === "paused") store.resume();
        return;
      }
      if (store.status !== "playing") return;

      if (key === "Escape") {
        store.select(null);
        return;
      }
      if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
        event.preventDefault();
        if (key === "ArrowUp") store.moveSelection(-1, 0);
        if (key === "ArrowDown") store.moveSelection(1, 0);
        if (key === "ArrowLeft") store.moveSelection(0, -1);
        if (key === "ArrowRight") store.moveSelection(0, 1);
        return;
      }
      if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        store.erase();
        return;
      }
      if (key === "n" || key === "N") {
        store.toggleNotesMode();
        return;
      }
      if (key === "h" || key === "H") {
        store.requestHint();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && (key === "z" || key === "Z")) {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && (key === "y" || key === "Y")) {
        event.preventDefault();
        store.redo();
        return;
      }
      if (/^[1-9]$/.test(key)) store.inputDigit(Number(key) as Digit);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
