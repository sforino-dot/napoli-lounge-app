import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import { OnAirBar } from "@/src/components/on-air-bar";
import { PillTabBar } from "@/src/components/pill-tab-bar";
import { ThemeBackground } from "@/src/components/theme-background";

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <ThemeBackground />
      <OnAirBar />
      <View style={styles.root}>
        <Tabs
          tabBar={(props) => <PillTabBar {...props} />}
          screenOptions={{ headerShown: false, lazy: false, sceneStyle: { backgroundColor: "transparent" } }}
        >
          <Tabs.Screen name="index" options={{ title: "In onda" }} />
          <Tabs.Screen name="meteo" options={{ title: "Meteo/News" }} />
          <Tabs.Screen name="social" options={{ title: "Social" }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
