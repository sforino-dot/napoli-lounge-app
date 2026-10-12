import { useIsFocused } from "expo-router";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

// Le schede restano sempre montate (stato e scroll conservati): quelle non attive
// vengono solo nascoste, perché le scene sono trasparenti sopra lo sfondo del tema.
export function TabScene({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return (
    <View style={[styles.root, !focused && styles.hidden]} pointerEvents={focused ? "auto" : "none"}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { opacity: 0 },
});
