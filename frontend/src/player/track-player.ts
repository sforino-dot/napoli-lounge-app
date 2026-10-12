// Player principale (development/production build): react-native-track-player.
// Background, schermata di blocco, cuffie, interruzioni e riconnessione automatica.
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  IOSCategory,
  State,
} from "react-native-track-player";

import { DEFAULT_TITLE, LOGO_URL, STATION_NAME, STREAM_URL } from "@/src/config";
import { RadioPlayer, setStatus } from "@/src/player/store";

let ready: Promise<void> | null = null;
let wantPlaying = false;
let retries = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let title = DEFAULT_TITLE;

const meta = () => ({ title, artist: STATION_NAME, album: "In diretta", artwork: LOGO_URL });

function clearRetry() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
}

function scheduleReconnect() {
  if (!wantPlaying || retryTimer) return;
  setStatus("loading");
  const delay = Math.min(2000 * 2 ** retries, 30000);
  retries++;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (wantPlaying) startStream().catch(scheduleReconnect);
  }, delay);
}

async function startStream() {
  await setup();
  await TrackPlayer.reset();
  await TrackPlayer.add({ id: "live", url: STREAM_URL, isLiveStream: true, ...meta() });
  await TrackPlayer.play();
}

async function setup() {
  if (!ready) {
    ready = (async () => {
      try {
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true, iosCategory: IOSCategory.Playback });
      } catch {
        // già inizializzato
      }
      await TrackPlayer.updateOptions({
        capabilities: [Capability.Play, Capability.Pause],
        compactCapabilities: [Capability.Play, Capability.Pause],
        notificationCapabilities: [Capability.Play, Capability.Pause],
        android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification },
      });
      TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
        switch (state) {
          case State.Playing:
            wantPlaying = true;
            retries = 0;
            clearRetry();
            setStatus("playing");
            break;
          case State.Paused:
            // Pausa da utente, schermata di blocco, cuffie o interruzione di sistema.
            wantPlaying = false;
            clearRetry();
            setStatus("paused");
            break;
          case State.Error:
          case State.Ended:
            if (wantPlaying) scheduleReconnect();
            else setStatus("paused");
            break;
          default:
            setStatus(wantPlaying ? "loading" : "paused");
        }
      });
      TrackPlayer.addEventListener(Event.PlaybackError, () => scheduleReconnect());
      TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => scheduleReconnect());
    })();
  }
  return ready;
}

async function play() {
  wantPlaying = true;
  retries = 0;
  clearRetry();
  setStatus("loading");
  try {
    await startStream(); // per una diretta si riparte sempre dal live
  } catch {
    scheduleReconnect();
  }
}

async function pause() {
  wantPlaying = false;
  clearRetry();
  setStatus("paused");
  try {
    await TrackPlayer.pause();
  } catch {}
}

async function updateMetadata(newTitle: string) {
  title = newTitle || DEFAULT_TITLE;
  if (!ready) return;
  try {
    await TrackPlayer.updateMetadataForTrack(0, meta());
  } catch {}
  try {
    await TrackPlayer.updateNowPlayingMetadata(meta());
  } catch {}
}

async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => play());
  TrackPlayer.addEventListener(Event.RemotePause, () => pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => pause());
}

const player: RadioPlayer = {
  registerService: () => TrackPlayer.registerPlaybackService(() => PlaybackService),
  setup,
  play,
  pause,
  updateMetadata,
};

export default player;
