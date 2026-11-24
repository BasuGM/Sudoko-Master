"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { logicalSolve, parsePuzzle, solve } from "@/engine";
import { SudokuBoard } from "@/components/board/SudokuBoard";
import { flagList } from "@/components/board/highlights";
import { Button } from "@/components/ui/button";
import { lessonById, LESSONS, type Lesson } from "@/content/lessons";
import { difficultyLabel } from "@/constants/game";
import { useGameStore } from "@/store/game-store";

const EMPTY_FLAGS = Array<boolean>(81).fill(false);

export function LearnList() {
  return (
    <section>
      <p className="text-sm text-muted">Learn</p>
      <h1 className="mt-2 max-w-xl font-display text-4xl leading-tight tracking-tight">
        Why a number belongs in a cell.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
        Each technique is a pattern you can see, not a guess. Step through a real puzzle, or study the shape on its own.
      </p>
      <ol className="mt-10 divide-y divide-line border-y border-line">
        {LESSONS.map((lesson, index) => (
          <li key={lesson.id}>
            <Link href={`/learn/${lesson.id}`} className="flex items-baseline justify-between gap-6 py-4">
              <span>
                <span className="mr-3 text-sm text-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                {lesson.name}
              </span>
              <span className="text-sm text-muted">{difficultyLabel(lesson.difficulty)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LessonView({ id }: { id: string }) {
  const lesson = lessonById(id);
  if (!lesson) {
    return (
      <section>
        <h1 className="font-display text-4xl">That technique is not in the set.</h1>
        <Link href="/learn" className="mt-6 inline-block text-sm underline underline-offset-4">
          Back to lessons
        </Link>
      </section>
    );
  }
  return <LessonPlayer lesson={lesson} />;
}

function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const traced = useMemo(() => {
    if (!lesson.puzzle) return null;
    const parsed = parsePuzzle(lesson.puzzle);
    if (!parsed.ok) return null;
    return { puzzle: parsed.grid, result: logicalSolve(parsed.grid, true) };
  }, [lesson.puzzle]);
  const maxIndex = traced ? Math.max(0, traced.result.steps.length - 1) : 0;
  const [index, setIndex] = useState(Math.min(lesson.focusStep ?? 0, maxIndex));
  const step = traced?.result.steps[index];
  const entries = traced ? (traced.result.frames[index] ?? traced.puzzle) : (lesson.demo?.entries ?? []);
  const notes = traced ? (traced.result.candidateFrames[index] ?? []) : (lesson.demo?.notes ?? []);
  const highlights = step ? flagList(step.cells) : flagList(lesson.demo?.highlights ?? []);
  const givens = entries.map((value, cell) => {
    if (!traced) return false;
    return traced.puzzle[cell] !== 0;
  });

  function practice() {
    if (!traced) return;
    const solution = solve(traced.puzzle);
    if (!solution) return;
    useGameStore.getState().loadPuzzle({
      puzzle: traced.puzzle,
      solution,
      difficulty: lesson.difficulty,
      mode: "practice",
      dailyDate: null,
      seed: null,
      recordStats: false,
      practiceTechnique: lesson.id,
    });
    router.push("/game");
  }

  return (
    <article className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,560px)_minmax(16rem,1fr)]">
      <div>
        <SudokuBoard
          entries={entries}
          givens={givens}
          notes={notes}
          selected={null}
          peers={EMPTY_FLAGS}
          same={EMPTY_FLAGS}
          conflicts={EMPTY_FLAGS}
          wrong={EMPTY_FLAGS}
          emphasis={highlights}
          readOnly
          onSelect={() => undefined}
        />
        {traced ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button type="button" className="text-muted disabled:opacity-40" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
              Previous
            </button>
            <span className="tabular-nums text-muted">
              Step {index + 1} of {traced.result.steps.length}
            </span>
            <button
              type="button"
              className="text-muted disabled:opacity-40"
              disabled={index >= maxIndex}
              onClick={() => setIndex((value) => value + 1)}
            >
              Next
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{lesson.demo?.caption}</p>
        )}
      </div>
      <div>
        <Link href="/learn" className="text-sm text-muted">
          All techniques
        </Link>
        <p className="mt-4 text-sm text-muted">{difficultyLabel(lesson.difficulty)}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{lesson.name}</h1>
        <p className="mt-4 text-sm leading-6">{lesson.body}</p>
        {step ? <p className="mt-4 border-t border-line pt-4 text-sm leading-6">{step.explanation}</p> : null}
        {traced ? (
          <Button type="button" variant="solid" className="mt-6" onClick={practice}>
            Practice this puzzle
          </Button>
        ) : null}
      </div>
    </article>
  );
}
