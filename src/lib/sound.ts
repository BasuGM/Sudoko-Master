import { useSettingsStore } from "@/store/settings-store";

let context: AudioContext | null = null;

export function playTone(kind: "place" | "conflict" | "complete" | "hint"): void {
  if (typeof window === "undefined" || !useSettingsStore.getState().sound) return;
  const Audio = window.AudioContext;
  if (!Audio) return;
  if (!context) context = new Audio();
  if (context.state === "suspended") void context.resume();

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.value =
    kind === "conflict" ? 196 : kind === "complete" ? 523 : kind === "hint" ? 392 : 440;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.028, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "complete" ? 0.45 : 0.16));
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.5);
}
