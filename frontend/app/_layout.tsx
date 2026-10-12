import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { DEFAULT_TITLE } from "@/src/config";
import { player } from "@/src/player";
import { queryClient } from "@/src/query-client";
import { ScheduleProvider, useOnAir } from "@/src/schedule";
import { loadSavedTheme, useTheme } from "@/src/theme";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

// Servizio di playback di track-player (no-op in Expo Go / web).
player.registerService();

// Aggiorna titolo su schermata di blocco/notifica quando cambia il programma.
// L'artista è sempre "Napoli Lounge" (mai il campo host).
function NowPlayingSync() {
  const { onAir } = useOnAir();
  const title = onAir.current?.title || DEFAULT_TITLE;
  useEffect(() => {
    player.updateMetadata(title);
  }, [title]);
  return null;
}

export default function RootLayout() {
  const { colors } = useTheme();

  useEffect(() => {
    loadSavedTheme();
    player.setup().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <ScheduleProvider>
            <StatusBar style="light" />
            <NowPlayingSync />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.gradient[0] } }} />
          </ScheduleProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
