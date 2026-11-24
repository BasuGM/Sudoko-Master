import type { Digit } from "@/engine";

export function CandidateNotes({ mask }: { mask: number }) {
  return (
    <span className="candidate-notes" aria-hidden>
      {Array.from({ length: 9 }, (_, index) => {
        const digit = (index + 1) as Digit;
        const on = (mask & (1 << index)) !== 0;
        return (
          <span key={digit} className={on ? undefined : "invisible"}>
            {digit}
          </span>
        );
      })}
    </span>
  );
}
