import { useSyncExternalStore } from "react";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused";

export type RadioPlayer = {
  registerService: () => void;
  setup: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  updateMetadata: (title: string) => Promise<void>;
};

let status: PlayerStatus = "idle";
const listeners = new Set<() => void>();

export function setStatus(s: PlayerStatus) {
  if (s === status) return;
  status = s;
  listeners.forEach((l) => l());
}
export const getStatus = () => status;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const usePlayerStatus = () => useSyncExternalStore(subscribe, getStatus, getStatus);
