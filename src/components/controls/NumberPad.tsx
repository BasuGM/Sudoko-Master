"use client";

import type { Digit } from "@/engine";
import { cn } from "@/lib/utils";

export function NumberPad({
  counts,
  disabled,
  onDigit,
}: {
  counts: number[];
  disabled?: boolean;
  onDigit: (digit: Digit) => void;
}) {
  return (
    <div className="grid grid-cols-9 gap-1" aria-label="Numbers">
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((digit) => {
        const left = Math.max(0, 9 - (counts[digit] ?? 0));
        return (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(digit)}
            className={cn(
              "flex h-14 flex-col items-center justify-center border border-line bg-paper text-ink transition hover:border-ink disabled:opacity-40",
              left === 0 && "text-muted",
            )}
          >
            <span className="text-lg leading-none tabular-nums">{digit}</span>
            <span className="mt-1 text-[10px] tabular-nums text-muted">{left}</span>
          </button>
        );
      })}
    </div>
  );
}
