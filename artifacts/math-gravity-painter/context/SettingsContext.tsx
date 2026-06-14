import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Language } from "@/data/i18n";

interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  vibration: boolean;
  language: Language;
}

interface SettingsContextType extends SettingsState {
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setVibration: (v: boolean) => void;
  setLanguage: (l: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);
const STORAGE_KEY = "mgp_settings";

const defaults: SettingsState = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  vibration: true,
  language: "en",
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(defaults);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setState(s => ({ ...s, ...JSON.parse(raw) })); } catch {}
      }
    });
  }, []);

  const save = useCallback((next: SettingsState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return (
    <SettingsContext.Provider value={{
      ...state,
      setMusicVolume: v => save({ ...state, musicVolume: v }),
      setSfxVolume: v => save({ ...state, sfxVolume: v }),
      setVibration: v => save({ ...state, vibration: v }),
      setLanguage: l => save({ ...state, language: l }),
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
