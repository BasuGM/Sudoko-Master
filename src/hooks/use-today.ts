"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "@/lib/dates";

function subscribe(): () => void {
  return () => {};
}

function snapshot(): string | null {
  return todayKey(new Date());
}

function serverSnapshot(): string | null {
  return null;
}

/** UTC date. The server snapshot stays empty so prerender does not bake in the clock. */
export function useToday(): string | null {
  return useSyncExternalStore<string | null>(subscribe, snapshot, serverSnapshot);
}
