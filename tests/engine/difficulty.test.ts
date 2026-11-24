import { describe, expect, it } from "vitest";
import { classifyDifficulty } from "@/engine/difficulty";
import type { SolveStep } from "@/engine";

function step(technique: SolveStep["technique"]): SolveStep {
  return { technique, explanation: "Example.", cells: [0] };
}

describe("difficulty", () => {
  it("bands techniques from singles through swordfish", () => {
    expect(classifyDifficulty([step("naked-single"), step("hidden-single")], true)).toBe("easy");
    expect(classifyDifficulty([step("naked-pair")], true)).toBe("medium");
    expect(classifyDifficulty([step("pointing-pair"), step("box-line-reduction")], true)).toBe(
      "medium",
    );
    expect(classifyDifficulty([step("naked-triple")], true)).toBe("hard");
    expect(classifyDifficulty([step("x-wing")], true)).toBe("hard");
    expect(
      classifyDifficulty([step("x-wing"), step("naked-triple"), step("x-wing")], true),
    ).toBe("expert");
    expect(classifyDifficulty([step("swordfish")], true)).toBe("expert");
    expect(classifyDifficulty([step("naked-single")], false)).toBeNull();
  });
});
