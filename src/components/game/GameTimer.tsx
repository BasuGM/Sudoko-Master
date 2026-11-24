"use client";

import { formatDuration } from "@/lib/time";
import { useTimerStore } from "@/store/timer-store";

export function GameTimer() {
  const elapsed = useTimerStore((state) => state.elapsedMs);
  return <span className="tabular-nums">{formatDuration(elapsed)}</span>;
}
