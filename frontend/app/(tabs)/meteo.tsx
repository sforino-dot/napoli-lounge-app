import Feather from "@react-native-vector-icons/feather";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { base44 } from "@/src/base44";
import { TAB_BAR_SPACE } from "@/src/components/pill-tab-bar";
import { TabScene } from "@/src/components/tab-scene";
import { useTheme } from "@/src/theme";
import { fetchWeather, Place, reverseGeocode, searchCity, Weather, wmoLabel } from "@/src/weather";

type News = { title: string; link: string };
type WState = "idle" | "loading" | "ok" | "error" | "notfound";

export default function MeteoNewsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [wState, setWState] = useState<WState>("idle");

  const [news, setNews] = useState<News[]>([]);
  const [nState, setNState] = useState<"loading" | "ok" | "error">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const locAsked = useRef(false);

  const loadWeather = useCallback(async (p: Place) => {
    setWState("loading");
    try {
      setWeather(await fetchWeather(p));
      setPlace(p);
      setWState("ok");
    } catch {
      setWState("error");
    }
  }, []);

  const loadNews = useCallback(async () => {
    try {
      const res: any = await base44.functions.invoke("getNews", {});
      const items = Array.isArray(res?.data?.items) ? res.data.items : [];
      setNews(items.slice(0, 5));
      setNState("ok");
    } catch {
      setNState("error");
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Posizione richiesta all'apertura della scheda (solo quando in uso). Se negata: nessun messaggio.
  useFocusEffect(
    useCallback(() => {
      if (locAsked.current) return;
      locAsked.current = true;
      (async () => {
        try {
          let perm = await Location.getForegroundPermissionsAsync();
          if (perm.status !== "granted" && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
          if (perm.status !== "granted") return;
          setWState("loading");
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          const p = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          await loadWeather(p);
        } catch {
          setWState((s) => (s === "loading" ? "idle" : s));
        }
      })();
    }, [loadWeather]),
  );

  const onSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setWState("loading");
    try {
      const p = await searchCity(q);
      if (!p) return setWState("notfound");
      await loadWeather(p);
    } catch {
      setWState("error");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([place ? loadWeather(place) : Promise.resolve(), loadNews()]);
    setRefreshing(false);
  };

  const card = { backgroundColor: colors.card, borderColor: colors.cardBorder };

  return (
    <TabScene>
    <KeyboardAwareScrollView
      testID="meteo-news-screen"
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom + 16 }]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bottomOffset={TAB_BAR_SPACE}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.accentSolid]} />}
    >
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.accentSolid }]}>
          <Feather name="file-text" size={22} color="#ffffff" />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.title, { color: colors.text }]}>Meteo/News</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Le notizie del giorno e il meteo della tua città</Text>
        </View>
      </View>

      <Text style={[styles.section, { color: colors.accent }]}>METEO DELLA TUA CITTÀ</Text>
      <View style={styles.searchRow}>
        <TextInput
          testID="weather-search-input"
          value={query}
          onChangeText={setQuery}
          placeholder="Es. Napoli, Roma, Milano..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={onSearch}
          style={[styles.input, card, { color: colors.text }]}
        />
        <Pressable
          testID="weather-search-button"
          accessibilityLabel="Cerca"
          onPress={onSearch}
          style={({ pressed }) => [styles.searchBtn, { backgroundColor: colors.accentSolid }, pressed && { opacity: 0.8 }]}
        >
          <Feather name="search" size={20} color="#ffffff" />
        </Pressable>
      </View>

      {wState === "loading" && (
        <View style={[styles.card, card, styles.centerRow]}>
          <ActivityIndicator color={colors.text} />
          <Text style={[styles.muted, { color: colors.textMuted }]}>Caricamento meteo…</Text>
        </View>
      )}
      {wState === "error" && (
        <Text testID="weather-error" style={[styles.msg, { color: colors.textMuted }]}>Impossibile caricare il meteo. Riprova.</Text>
      )}
      {wState === "notfound" && (
        <Text testID="weather-notfound" style={[styles.msg, { color: colors.textMuted }]}>Città non trovata. Riprova con un altro nome.</Text>
      )}
      {wState === "ok" && weather && place && (
        <View testID="weather-card" style={[styles.card, card]}>
          <Text testID="weather-city" style={[styles.city, { color: colors.text }]}>{place.name}</Text>
          {!!(place.region || place.country) && (
            <Text style={[styles.muted, { color: colors.textMuted }]}>{[place.region, place.country].filter(Boolean).join(", ")}</Text>
          )}
          <View style={styles.tempRow}>
            <Text testID="weather-temp" style={[styles.temp, { color: colors.text }]}>{Math.round(weather.temp)}°</Text>
            <Text testID="weather-condition" style={[styles.cond, { color: colors.text }]}>{wmoLabel(weather.code)}</Text>
          </View>
          <View style={styles.boxes}>
            <View style={[styles.box, card]}>
              <Feather name="droplet" size={16} color={colors.accent} />
              <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Umidità</Text>
              <Text testID="weather-humidity" style={[styles.boxValue, { color: colors.text }]}>{Math.round(weather.humidity)}%</Text>
            </View>
            <View style={[styles.box, card]}>
              <Feather name="wind" size={16} color={colors.accent} />
              <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Vento</Text>
              <Text testID="weather-wind" style={[styles.boxValue, { color: colors.text }]}>{Math.round(weather.wind)} km/h</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={[styles.section, { color: colors.accent, marginTop: 28 }]}>ULTIME NOTIZIE</Text>
      {nState === "loading" && <Text style={[styles.msg, { color: colors.textMuted }]}>Caricamento notizie…</Text>}
      {nState === "error" && <Text testID="news-error" style={[styles.msg, { color: colors.textMuted }]}>Notizie non disponibili al momento.</Text>}
      {nState === "ok" && news.length === 0 && (
        <Text testID="news-empty" style={[styles.msg, { color: colors.textMuted }]}>Nessuna notizia al momento.</Text>
      )}
      {nState === "ok" &&
        news.map((n, i) => (
          <Pressable
            key={`${n.link}-${i}`}
            testID={`news-item-${i}`}
            onPress={() => Linking.openURL(n.link)}
            style={({ pressed }) => [styles.newsRow, card, pressed && { opacity: 0.8 }]}
          >
            <Text style={[styles.newsTitle, { color: colors.text }]}>{n.title}</Text>
            <Feather name="external-link" size={18} color={colors.accent} />
          </Pressable>
        ))}
      <Text testID="news-source" style={[styles.source, { color: colors.textMuted }]}>Fonte: la Repubblica – Napoli</Text>
    </KeyboardAwareScrollView>
    </TabScene>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1.6, marginBottom: 10 },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  searchBtn: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  centerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  muted: { fontSize: 13 },
  msg: { fontSize: 13, paddingVertical: 8 },
  city: { fontSize: 20, fontWeight: "800" },
  tempRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 8 },
  temp: { fontSize: 56, fontWeight: "800" },
  cond: { fontSize: 16, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  boxes: { flexDirection: "row", gap: 10 },
  box: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, gap: 2 },
  boxLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  boxValue: { fontSize: 17, fontWeight: "700" },
  newsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  newsTitle: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 19 },
  source: { fontSize: 11, textAlign: "center", marginTop: 8 },
});
