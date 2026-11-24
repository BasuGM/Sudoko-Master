"use client";

import { SudokuCell } from "@/components/board/SudokuCell";

export interface BoardProps {
  entries: number[];
  givens: boolean[];
  notes: number[];
  selected: number | null;
  peers: boolean[];
  same: boolean[];
  conflicts: boolean[];
  wrong: boolean[];
  emphasis: boolean[];
  readOnly?: boolean;
  onSelect: (index: number) => void;
}

export function SudokuBoard({
  entries,
  givens,
  notes,
  selected,
  peers,
  same,
  conflicts,
  wrong,
  emphasis,
  readOnly = false,
  onSelect,
}: BoardProps) {
  return (
    <div role="grid" aria-label="Sudoku board" className="sudoku-board">
      {entries.map((value, index) => (
        <SudokuCell
          key={index}
          index={index}
          value={value}
          given={givens[index]}
          notes={notes[index] ?? 0}
          selected={selected === index}
          peer={peers[index]}
          same={same[index]}
          conflict={conflicts[index]}
          wrong={wrong[index]}
          emphasis={emphasis[index]}
          readOnly={readOnly}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
