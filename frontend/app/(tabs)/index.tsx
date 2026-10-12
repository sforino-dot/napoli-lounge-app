import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_SPACE } from "@/src/components/pill-tab-bar";
import { TabScene } from "@/src/components/tab-scene";
import { LOGO_URL, PRIVACY_URL, SEASONAL_IMAGE_URL, STATION_NAME, STATION_TAGLINE } from "@/src/config";
import { player, usePlayerStatus } from "@/src/player";
import { useTheme } from "@/src/theme";

export default function OnAirScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { colors } = useTheme();
  const status = usePlayerStatus();
  const playing = status === "playing";
  const loading = status === "loading";
  const seasonalH = Math.min(132, Math.max(68, height * 0.14));

  return (
    <TabScene>
    <View testID="on-air-screen" style={[styles.root, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}>
      <View style={styles.top}>
        <Image testID="station-logo" source={{ uri: LOGO_URL }} style={styles.logo} contentFit="contain" />
        <Text testID="station-name" style={[styles.name, { color: colors.text }]}>{STATION_NAME}</Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>{STATION_TAGLINE}</Text>
      </View>

      <View style={styles.center}>
        <Pressable
          testID="play-pause-button"
          accessibilityRole="button"
          accessibilityLabel={playing || loading ? "Pausa" : "Riproduci"}
          onPress={() => (playing || loading ? player.pause() : player.play())}
          style={({ pressed }) => [
            styles.playShadow,
            { shadowColor: colors.accent, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentSolid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.play}
          >
            {loading ? (
              <ActivityIndicator testID="player-loading" size="large" color="#ffffff" />
            ) : (
              <Feather name={playing ? "pause" : "play"} size={48} color="#ffffff" style={!playing && { marginLeft: 6 }} />
            )}
          </LinearGradient>
        </Pressable>
        <Text style={[styles.liveLabel, { color: colors.textMuted }]}>● In diretta</Text>
      </View>

      <View style={styles.bottom}>
        <Image
          testID="seasonal-image"
          source={{ uri: SEASONAL_IMAGE_URL }}
          style={[styles.seasonal, { height: seasonalH }]}
          contentFit="contain"
        />
        <Pressable testID="privacy-policy-link" hitSlop={10} onPress={() => Linking.openURL(PRIVACY_URL)}>
          <Text style={[styles.privacy, { color: colors.textMuted }]}>Privacy Policy</Text>
        </Pressable>
      </View>
    </View>
    </TabScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  top: { alignItems: "center", gap: 6 },
  logo: { width: 80, height: 80, borderRadius: 20 },
  name: { fontSize: 28, fontWeight: "800", marginTop: 4 },
  tagline: { fontSize: 13, textAlign: "center", maxWidth: 256 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  playShadow: {
    borderRadius: 48,
    shadowOpacity: 0.7,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  play: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  liveLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.4 },
  bottom: { alignItems: "center", gap: 8, paddingBottom: 4 },
  seasonal: { width: "100%", maxWidth: 190, borderRadius: 14 },
  privacy: { fontSize: 10, textTransform: "uppercase", textDecorationLine: "underline", letterSpacing: 1 },
});
