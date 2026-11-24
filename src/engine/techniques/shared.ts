import { BOXES, COLS, ROWS } from "../grid";

export type HouseKind = "row" | "column" | "box";

export interface House {
  cells: number[];
  kind: HouseKind;
  index: number;
}

export function eachHouse(): House[] {
  return [
    ...ROWS.map((cells, index) => ({ cells, kind: "row" as const, index })),
    ...COLS.map((cells, index) => ({ cells, kind: "column" as const, index })),
    ...BOXES.map((cells, index) => ({ cells, kind: "box" as const, index })),
  ];
}

export function houseLabel(kind: HouseKind, index: number): string {
  return `${kind} ${index + 1}`;
}

export function uniqueIndexes(indexes: number[]): number[] {
  return [...new Set(indexes)];
}

export function combinations<T>(items: T[], size: number): T[][] {
  const results: T[][] = [];
  const current: T[] = [];

  const visit = (start: number) => {
    if (current.length === size) {
      results.push(current.slice());
      return;
    }
    for (let index = start; index < items.length; index += 1) {
      current.push(items[index]);
      visit(index + 1);
      current.pop();
    }
  };

  visit(0);
  return results;
}
