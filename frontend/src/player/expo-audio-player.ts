// Fallback SOLO per anteprima (Expo Go e web): niente background né schermata di blocco.
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

import { STREAM_URL } from "@/src/config";
import { RadioPlayer, setStatus } from "@/src/player/store";

let p: AudioPlayer | null = null;
let want = false;

async function play() {
  want = true;
  setStatus("loading");
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {}
  p?.remove();
  const ap = createAudioPlayer({ uri: STREAM_URL });
  p = ap;
  ap.addListener("playbackStatusUpdate", (s) => {
    if (!want || p !== ap) return;
    if (s.playing) setStatus("playing");
    else if (s.didJustFinish) play();
    else setStatus("loading");
  });
  ap.play();
}

async function pause() {
  want = false;
  p?.pause();
  setStatus("paused");
}

const player: RadioPlayer = {
  registerService: () => {},
  setup: async () => {},
  play,
  pause,
  updateMetadata: async () => {},
};

export default player;
