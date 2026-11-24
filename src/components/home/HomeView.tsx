"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, difficultyLabel } from "@/constants/game";
import { useAppReady } from "@/components/layout/AppProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { createPuzzle } from "@/lib/create-puzzle";
import { importPuzzle } from "@/lib/import-puzzle";
import { formatDuration, formatPercent } from "@/lib/time";
import { summarize } from "@/lib/stats";
import { useToday } from "@/hooks/use-today";
import { useGameStore } from "@/store/game-store";
import { useStatisticsStore } from "@/store/statistics-store";
import { useTimerStore } from "@/store/timer-store";
import type { Difficulty } from "@/engine";

export function HomeView() {
  const router = useRouter();
  const ready = useAppReady();
  const status = useGameStore((state) => state.status);
  const difficulty = useGameStore((state) => state.difficulty);
  const entries = useGameStore((state) => state.entries);
  const mode = useGameStore((state) => state.mode);
  const elapsed = useTimerStore((state) => state.elapsedMs);
  const stats = useStatisticsStore();
  const today = useToday();
  const summary = today ? summarize(stats, today) : null;
  const [pending, setPending] = useState<Difficulty | null>(null);
  const [error, setError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [importError, setImportError] = useState("");

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
      router.push("/game");
    } catch {
      setError("A puzzle didn't settle. Try once more.");
    } finally {
      setPending(null);
    }
  }

  function submitImport() {
    const result = importPuzzle(draft);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    useGameStore.getState().loadPuzzle({
      puzzle: result.puzzle,
      solution: result.solution,
      difficulty: result.difficulty,
      mode: "casual",
      dailyDate: null,
      seed: null,
      recordStats: true,
    });
    setImportOpen(false);
    router.push("/game");
  }

  const filled = entries.filter((value) => value !== 0).length;
  const active = ready && (status === "playing" || status === "paused");

  return (
    <section>
      <p className="text-sm text-muted">Play</p>
      <h1 className="mt-3 max-w-[12ch] font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
        Sit with a grid.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-6 text-muted">
        Four difficulties, rated by the technique they demand. One daily puzzle. Hints that explain the step.
      </p>

      {active ? (
        <Link href={mode === "daily" ? "/daily" : "/game"} className="mt-8 block border border-line px-5 py-4">
          <div className="flex items-baseline justify-between">
            <span>Continue</span>
            <span className="text-sm text-muted">{mode === "daily" ? "Daily" : difficultyLabel(difficulty)}</span>
          </div>
          <p className="mt-2 text-sm text-muted tabular-nums">
            {formatDuration(elapsed)} · {filled} filled
          </p>
        </Link>
      ) : null}

      <h2 className="mt-12 text-sm uppercase tracking-[0.16em] text-muted">New game</h2>
      <div className="mt-3 divide-y divide-line border-y border-line">
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

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <Link href="/daily" className="underline decoration-line underline-offset-4">
          Today&apos;s daily
        </Link>
        <button type="button" className="text-muted underline decoration-line underline-offset-4" onClick={() => setImportOpen(true)}>
          Import a puzzle
        </button>
      </div>

      <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6">
        <div>
          <dt className="text-sm text-muted">Streak</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums">{ready && summary ? summary.currentStreak : "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Win rate</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums">{ready && summary ? formatPercent(summary.winRate) : "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Best</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums">
            {ready && summary?.bestMs != null ? formatDuration(summary.bestMs) : "—"}
          </dd>
        </div>
      </dl>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogTitle>Import</DialogTitle>
          <DialogDescription>81 cells. Digits 1–9, and dots or zeros for the empty ones.</DialogDescription>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            className="mt-4 w-full border border-line bg-paper p-3 font-mono text-sm"
            aria-label="Puzzle text"
          />
          {importError ? <p className="mt-2 text-sm text-muted">{importError}</p> : null}
          <Button type="button" variant="solid" className="mt-4" onClick={submitImport}>
            Play this puzzle
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
