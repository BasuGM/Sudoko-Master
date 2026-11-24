import { PEERS } from "@/engine";

export function peerFlags(selected: number | null): boolean[] {
  const flags = Array<boolean>(81).fill(false);
  if (selected == null) return flags;
  for (const peer of PEERS[selected]) flags[peer] = true;
  return flags;
}

export function sameNumberFlags(entries: number[], selected: number | null): boolean[] {
  const flags = Array<boolean>(81).fill(false);
  if (selected == null) return flags;
  const value = entries[selected];
  if (!value) return flags;
  for (let index = 0; index < 81; index += 1) {
    if (entries[index] === value) flags[index] = true;
  }
  return flags;
}

export function flagList(indexes: number[]): boolean[] {
  const flags = Array<boolean>(81).fill(false);
  for (const index of indexes) if (index >= 0 && index < 81) flags[index] = true;
  return flags;
}
