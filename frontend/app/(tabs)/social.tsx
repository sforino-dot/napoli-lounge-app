import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_SPACE } from "@/src/components/pill-tab-bar";
import { TabScene } from "@/src/components/tab-scene";
import { simpleIconUrl, Social, SOCIALS } from "@/src/config";
import { useTheme } from "@/src/theme";

function Badge({ s }: { s: Social }) {
  const inner = s.feather ? (
    <Feather name={s.feather} size={22} color="#ffffff" />
  ) : (
    <Image source={{ uri: simpleIconUrl(s.slug!) }} style={styles.brand} contentFit="contain" />
  );
  if (s.gradient) {
    return (
      <LinearGradient colors={s.gradient as [string, string, ...string[]]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.badge}>
        {inner}
      </LinearGradient>
    );
  }
  return <View style={[styles.badge, { backgroundColor: s.color }]}>{inner}</View>;
}

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <TabScene>
    <View testID="social-screen" style={[styles.root, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}>
      <Text style={[styles.title, { color: colors.text }]}>Seguici</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Resta in contatto con Napoli Lounge</Text>
      <View style={styles.list}>
        {SOCIALS.map((s) => (
          <Pressable
            key={s.key}
            testID={`social-${s.key}`}
            onPress={() => Linking.openURL(s.url)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Badge s={s} />
            <View style={styles.texts}>
              <Text style={[styles.name, { color: colors.text }]}>{s.name}</Text>
              <Text numberOfLines={1} style={[styles.sub, { color: colors.textMuted }]}>{s.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
    </TabScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4 },
  list: { flex: 1, justifyContent: "space-evenly", paddingVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  brand: { width: 22, height: 22 },
  texts: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 1 },
});
