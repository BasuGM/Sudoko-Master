"use client";

import { memo } from "react";
import { colOf, rowOf } from "@/engine";
import { CandidateNotes } from "@/components/board/CandidateNotes";
import { cn } from "@/lib/utils";

export interface CellProps {
  index: number;
  value: number;
  given: boolean;
  notes: number;
  selected: boolean;
  peer: boolean;
  same: boolean;
  conflict: boolean;
  wrong: boolean;
  emphasis: boolean;
  readOnly?: boolean;
  onSelect: (index: number) => void;
}

export const SudokuCell = memo(function SudokuCell({
  index,
  value,
  given,
  notes,
  selected,
  peer,
  same,
  conflict,
  wrong,
  emphasis,
  readOnly = false,
  onSelect,
}: CellProps) {
  const row = rowOf(index) + 1;
  const column = colOf(index) + 1;
  const label = value
    ? `Row ${row}, column ${column}, ${given ? "clue" : "entered"} ${value}`
    : `Row ${row}, column ${column}, empty`;

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={selected}
      aria-label={`${label}${conflict || wrong ? ", conflict" : ""}`}
      disabled={readOnly}
      onClick={() => onSelect(index)}
      onFocus={() => {
        if (!readOnly) onSelect(index);
      }}
      className={cn(
        "sudoku-cell",
        given && "given",
        peer && "peer",
        same && "same",
        (conflict || wrong) && "conflict",
        selected && "selected",
        emphasis && "emphasis",
      )}
    >
      {value ? (
        <span key={`${index}-${value}`} className={given ? undefined : "value-enter"}>
          {value}
        </span>
      ) : notes ? (
        <CandidateNotes mask={notes} />
      ) : null}
    </button>
  );
});
