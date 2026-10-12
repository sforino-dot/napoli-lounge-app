import Constants, { ExecutionEnvironment } from "expo-constants";

import type { RadioPlayer } from "@/src/player/store";

// In Expo Go il modulo nativo di track-player non esiste: si usa il fallback di anteprima.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const usingTrackPlayer = !isExpoGo;

export const player: RadioPlayer = isExpoGo
  ? require("./expo-audio-player").default
  : require("./track-player").default;

export { usePlayerStatus } from "@/src/player/store";
