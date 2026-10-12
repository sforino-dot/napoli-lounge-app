// Temi dell'app (palette dal brief). Unico file di temi.
// Scelta salvata con chiave `radio_theme_id`; altrimenti aspetto del telefono:
// scuro → inverno, chiaro → estate.
import { useMemo, useSyncExternalStore } from "react";
import { StyleSheet, useColorScheme } from "react-native";

import { mediaUrl } from "@/src/config";
import { storage } from "@/src/utils/storage";

export type RadioTheme = {
  id: string;
  gradient: [string, string, string];
  accent: string;
  accentSolid: string;
  text: string;
  textMuted: string;
  card: string;
  cardBorder: string;
  background: string;
};

const t = (
  id: string, a: string, b: string, c: string, accent: string, accentSolid: string,
  text: string, textMuted: string, card: string, cardBorder: string, file: string,
): RadioTheme => ({ id, gradient: [a, b, c], accent, accentSolid, text, textMuted, card, cardBorder, background: mediaUrl(file) });

export const THEMES: Record<string, RadioTheme> = {
  estate: t("estate", "#0a6e7a", "#0fb8c9", "#f6c177", "#00e2f2", "#00b8c4", "#ffffff", "rgba(255,255,255,0.72)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.22)", "8dc355fc0_generated_image.png"),
  ferragosto: t("ferragosto", "#0b3d66", "#2b8fc9", "#ffd98a", "#ffb703", "#e09b00", "#ffffff", "rgba(255,255,255,0.72)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.24)", "b37fb69ed_generated_image.png"),
  primavera: t("primavera", "#3a8a5c", "#8fd694", "#ffd9ec", "#ff8fb1", "#e96f93", "#ffffff", "rgba(255,255,255,0.75)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0.28)", "793f89fba_generated_image.png"),
  pasqua: t("pasqua", "#7b5ea7", "#c8b6e2", "#fff1c9", "#ffd166", "#e0a93c", "#ffffff", "rgba(255,255,255,0.76)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0.28)", "c19b5ba0e_generated_image.png"),
  autunno: t("autunno", "#5a2a0a", "#c0651f", "#f0a35e", "#ff9248", "#d9722e", "#fff7ed", "rgba(255,247,237,0.72)", "rgba(255,247,237,0.10)", "rgba(255,247,237,0.24)", "82d79b535_generated_image.png"),
  inverno: t("inverno", "#0b2740", "#3a6ea5", "#cfe3f5", "#7fd4ff", "#4aa8e0", "#ffffff", "rgba(255,255,255,0.72)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.24)", "823c3f3dd_generated_image.png"),
  natale: t("natale", "#3a0d0d", "#b3261e", "#e8b339", "#ffd24a", "#e0a82e", "#fffaf0", "rgba(255,250,240,0.74)", "rgba(255,250,240,0.10)", "rgba(255,250,240,0.26)", "0794e35d1_generated_image.png"),
  capodanno: t("capodanno", "#0a0a0a", "#1a1a1a", "#3a2a00", "#ffd700", "#d4af00", "#fffde7", "rgba(255,253,231,0.70)", "rgba(255,215,0,0.08)", "rgba(255,215,0,0.30)", "169e7c5ee_generated_image.png"),
  sanvalentino: t("sanvalentino", "#4a0e2e", "#d6336c", "#ffc2d1", "#ff5c8a", "#e0336a", "#fff0f5", "rgba(255,240,245,0.74)", "rgba(255,240,245,0.10)", "rgba(255,240,245,0.28)", "5b8b31324_generated_image.png"),
  halloween: t("halloween", "#1a0a2e", "#4a148c", "#ff6f00", "#ff8c00", "#e65100", "#fff3e0", "rgba(255,243,224,0.72)", "rgba(255,243,224,0.08)", "rgba(255,243,224,0.24)", "4ae2ae3ee_generated_image.png"),
};

export const THEME_STORAGE_KEY = "radio_theme_id";

let savedId: string | null = null;
const listeners = new Set<() => void>();

export async function loadSavedTheme() {
  const id = await storage.getItem(THEME_STORAGE_KEY, null as string | null);
  savedId = typeof id === "string" && THEMES[id] ? id : null;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSaved = () => savedId;

export function useTheme(): { colors: RadioTheme } {
  const scheme = useColorScheme();
  const id = useSyncExternalStore(subscribe, getSaved, getSaved);
  const theme = (id && THEMES[id]) || (scheme === "dark" ? THEMES.inverno : THEMES.estate);
  return { colors: theme };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: RadioTheme) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
