import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";

type ColorPreference = "light" | "dark" | "system";

interface ThemeState {
  preference: ColorPreference;
  resolved: "light" | "dark";
  setPreference: (pref: ColorPreference) => void;
}

function resolveTheme(pref: ColorPreference): "light" | "dark" {
  if (pref === "system") return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  return pref;
}

const STORAGE_KEY = "gg_theme";

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  resolved: resolveTheme("system"),
  setPreference: async (preference) => {
    await AsyncStorage.setItem(STORAGE_KEY, preference);
    set({ preference, resolved: resolveTheme(preference) });
  },
}));

// Load persisted preference on startup
AsyncStorage.getItem(STORAGE_KEY).then((val) => {
  if (val === "light" || val === "dark" || val === "system") {
    useThemeStore.getState().setPreference(val);
  }
});
