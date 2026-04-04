"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME_ID, THEMES, THEME_LIST, type ThemeDefinition, type ThemeId } from "@/themes/registry";

type ThemeContextValue = {
  themeId: ThemeId;
  theme: ThemeDefinition;
  themes: ThemeDefinition[];
  setThemeId: (themeId: ThemeId) => void;
};

const STORAGE_KEY = "openstar-theme-id";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeVariables(theme: ThemeDefinition) {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  root.dataset.theme = theme.id;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_THEME_ID;
    }

    const savedThemeId = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return savedThemeId && THEMES[savedThemeId] ? savedThemeId : DEFAULT_THEME_ID;
  });

  useEffect(() => {
    const theme = THEMES[themeId];
    applyThemeVariables(theme);
    window.localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      theme: THEMES[themeId],
      themes: THEME_LIST,
      setThemeId: (nextThemeId) => setThemeIdState(nextThemeId),
    }),
    [themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
