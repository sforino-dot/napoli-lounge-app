import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme";

// Gradiente CSS 160° + immagine del tema al 25% di opacità.
export function ThemeBackground() {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={colors.gradient}
        locations={[0, 0.5, 1]}
        start={{ x: 0.33, y: 0 }}
        end={{ x: 0.67, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image
        testID="theme-background-image"
        source={{ uri: colors.background }}
        style={[StyleSheet.absoluteFill, { opacity: 0.25 }]}
        contentFit="cover"
        contentPosition="center"
        cachePolicy="memory-disk"
      />
    </View>
  );
}
