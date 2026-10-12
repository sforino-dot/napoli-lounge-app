import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DEFAULT_TITLE, displayHost } from "@/src/config";
import { fmtMin, useOnAir } from "@/src/schedule";
import { useTheme } from "@/src/theme";

const pad = (n: number) => String(n).padStart(2, "0");

function PulseDot({ color }: { color: string }) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.25, { duration: 900 }), -1, true);
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

export function OnAirBar() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { now, onAir } = useOnAir();
  const cur = onAir.current;
  const host = displayHost(cur?.host);
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const progress = cur ? Math.min(1, Math.max(0, (onAir.nowMin - onAir.start) / (onAir.end - onAir.start))) : 0;

  return (
    <View
      testID="on-air-bar"
      style={[styles.wrap, { paddingTop: insets.top + 4, backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.liveRow}>
            <PulseDot color={colors.accent} />
            <Text style={[styles.live, { color: colors.accent }]}>IN ONDA ORA</Text>
          </View>
          <Text testID="on-air-clock" style={[styles.clock, { color: colors.text }]}>{clock}</Text>
        </View>
        <View style={styles.right}>
          <Text testID="on-air-title" numberOfLines={1} style={[styles.title, { color: colors.text }]}>
            {cur?.title || DEFAULT_TITLE}
          </Text>
          {cur ? (
            host ? (
              <Text testID="on-air-host" numberOfLines={1} style={[styles.host, { color: colors.textMuted }]}>con {host}</Text>
            ) : null
          ) : (
            <Text testID="on-air-host" style={[styles.host, { color: colors.textMuted }]}>La musica continua</Text>
          )}
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
        <View testID="on-air-progress" style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
      </View>
      <View style={styles.row}>
        <Text testID="on-air-range" style={[styles.small, { color: colors.textMuted }]}>
          {cur ? `${fmtMin(onAir.start)} – ${fmtMin(onAir.end)}` : ""}
        </Text>
        <Text testID="on-air-next" numberOfLines={1} style={[styles.small, styles.next, { color: colors.textMuted }]}>
          {onAir.next ? `Prossimo: ${onAir.next.title} · ${fmtMin(onAir.end)}` : "Prossimo appuntamento"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 6, borderBottomWidth: 1, gap: 5 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  left: { gap: 1 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  live: { fontSize: 9, fontWeight: "600", letterSpacing: 1.4 },
  clock: { fontSize: 11, fontWeight: "300", fontVariant: ["tabular-nums"] },
  right: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 13, fontWeight: "700", textAlign: "right" },
  host: { fontSize: 11, fontWeight: "300", textAlign: "right" },
  track: { height: 2, borderRadius: 1, overflow: "hidden" },
  fill: { height: 2, borderRadius: 1 },
  small: { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: "400" },
  next: { flex: 1, textAlign: "right" },
});
