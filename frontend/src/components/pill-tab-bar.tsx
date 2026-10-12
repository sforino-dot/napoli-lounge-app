import Feather from "@react-native-vector-icons/feather";
import { BlurView } from "expo-blur";
import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

const TABS: Record<string, { label: string; icon: "radio" | "file-text" | "share-2" }> = {
  index: { label: "In onda", icon: "radio" },
  meteo: { label: "Meteo/News", icon: "file-text" },
  social: { label: "Social", icon: "share-2" },
};

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export const TAB_BAR_SPACE = 96; // spazio riservato sopra la safe area inferiore

export function PillTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={[styles.outer, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        {state.routes.map((route, i) => {
          const cfg = TABS[route.name];
          if (!cfg) return null;
          const focused = state.index === i;
          return (
            <Pressable
              key={route.key}
              testID={`tab-${route.name}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
              }}
              style={({ pressed }) => [
                styles.item,
                focused ? { backgroundColor: colors.accentSolid } : { opacity: 0.6 },
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Feather name={cfg.icon} size={18} color={focused ? "#ffffff" : colors.text} />
              <Text numberOfLines={1} style={[styles.label, { color: focused ? "#ffffff" : colors.text }]}>{cfg.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  pill: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 6,
    gap: 4,
    width: "100%",
    maxWidth: 420,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 6,
  },
  label: { fontSize: 11, fontWeight: "700" },
});
