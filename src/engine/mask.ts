import type { Digit } from "./types";

export const ALL_CANDIDATES = 0x1ff;

const BIT_COUNT = new Uint8Array(512);
for (let mask = 1; mask < 512; mask += 1) {
  BIT_COUNT[mask] = (mask & 1) + BIT_COUNT[mask >> 1];
}

export function bit(digit: number): number {
  return 1 << (digit - 1);
}

export function countBits(mask: number): number {
  return BIT_COUNT[mask & ALL_CANDIDATES];
}

export function hasBit(mask: number, digit: number): boolean {
  return (mask & bit(digit)) !== 0;
}

export function digitsOf(mask: number): Digit[] {
  const digits: Digit[] = [];
  for (let digit = 1; digit <= 9; digit += 1) {
    if (mask & (1 << (digit - 1))) digits.push(digit as Digit);
  }
  return digits;
}

export function formatDigits(digits: number[]): string {
  if (digits.length <= 1) return digits.join("");
  if (digits.length === 2) return `${digits[0]} and ${digits[1]}`;
  return `${digits.slice(0, -1).join(", ")}, and ${digits[digits.length - 1]}`;
}
