"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor =
  | "blue"
  | "emerald"
  | "amber"
  | "violet"
  | "indigo"
  | "rose"
  | "cyan"
  | "slate";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  category: string;
  hex: string;
  colors: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "blue",
    name: "Industrial Blue",
    category: "Precision Automation",
    hex: "#2563eb",
    colors: {
      50: "239 246 255",
      100: "219 234 254",
      200: "191 219 254",
      300: "147 197 253",
      400: "96 165 250",
      500: "59 130 246",
      600: "37 99 235",
      700: "29 78 216",
      800: "30 64 175",
      900: "30 58 138",
      950: "23 37 84",
    },
  },
  {
    id: "emerald",
    name: "Foundry Emerald",
    category: "Sustainable Tech",
    hex: "#059669",
    colors: {
      50: "236 253 245",
      100: "209 250 229",
      200: "167 243 208",
      300: "110 231 183",
      400: "52 211 153",
      500: "16 185 129",
      600: "5 150 105",
      700: "4 120 87",
      800: "6 95 70",
      900: "6 78 59",
      950: "2 44 34",
    },
  },
  {
    id: "amber",
    name: "Industrial Amber",
    category: "Safety & Heavy Machinery",
    hex: "#d97706",
    colors: {
      50: "255 251 235",
      100: "254 243 199",
      200: "253 230 138",
      300: "252 211 77",
      400: "251 191 36",
      500: "245 158 11",
      600: "217 119 6",
      700: "180 83 9",
      800: "146 64 14",
      900: "120 53 15",
      950: "69 26 3",
    },
  },
  {
    id: "violet",
    name: "Robotics Violet",
    category: "High-Tech & Robotics",
    hex: "#7c3aed",
    colors: {
      50: "245 243 255",
      100: "237 233 254",
      200: "221 214 254",
      300: "196 181 253",
      400: "167 139 250",
      500: "139 92 246",
      600: "124 58 237",
      700: "109 40 217",
      800: "91 33 182",
      900: "76 29 149",
      950: "46 16 101",
    },
  },
  {
    id: "indigo",
    name: "Aerospace Indigo",
    category: "Aviation Systems",
    hex: "#4f46e5",
    colors: {
      50: "238 242 255",
      100: "224 231 255",
      200: "199 210 254",
      300: "165 180 252",
      400: "129 140 248",
      500: "99 102 241",
      600: "79 70 229",
      700: "67 56 202",
      800: "55 48 163",
      900: "49 46 129",
      950: "30 27 75",
    },
  },
  {
    id: "rose",
    name: "Foundry Rose",
    category: "Thermal Metallurgy",
    hex: "#e11d48",
    colors: {
      50: "255 241 242",
      100: "255 228 230",
      200: "254 205 211",
      300: "253 164 175",
      400: "251 113 133",
      500: "244 63 94",
      600: "225 29 72",
      700: "190 18 60",
      800: "159 18 57",
      900: "136 19 55",
      950: "76 5 25",
    },
  },
  {
    id: "cyan",
    name: "Marine Tech Cyan",
    category: "Naval Engineering",
    hex: "#0891b2",
    colors: {
      50: "236 254 255",
      100: "207 250 254",
      200: "165 243 252",
      300: "103 232 249",
      400: "34 211 238",
      500: "6 182 212",
      600: "8 145 178",
      700: "14 116 144",
      800: "21 94 117",
      900: "22 78 99",
      950: "8 51 68",
    },
  },
  {
    id: "slate",
    name: "Titanium Slate",
    category: "CNC Machining & Steel",
    hex: "#475569",
    colors: {
      50: "248 250 252",
      100: "241 245 249",
      200: "226 232 240",
      300: "203 213 225",
      400: "148 163 184",
      500: "100 116 139",
      600: "71 85 105",
      700: "51 65 85",
      800: "30 41 59",
      900: "15 23 42",
      950: "2 6 23",
    },
  },
];

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentTheme: ThemeConfig;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_STORAGE_KEY = "mw_theme_color";
const MODE_STORAGE_KEY = "mw_theme_mode";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("blue");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedColor = localStorage.getItem(COLOR_STORAGE_KEY) as ThemeColor | null;
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode | null;

    if (savedColor && THEME_PRESETS.some((p) => p.id === savedColor)) {
      setThemeColorState(savedColor);
    }
    if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
      setThemeModeState(savedMode);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const activePreset =
      THEME_PRESETS.find((p) => p.id === themeColor) || THEME_PRESETS[0];

    const root = document.documentElement;
    root.setAttribute("data-theme", themeColor);

    Object.entries(activePreset.colors).forEach(([key, val]) => {
      root.style.setProperty(`--theme-${key}`, val);
    });

    try {
      localStorage.setItem(COLOR_STORAGE_KEY, themeColor);
    } catch {
      // ignore
    }
  }, [themeColor, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    const applyMode = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (themeMode === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyMode(systemDark);

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => applyMode(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      applyMode(themeMode === "dark");
    }

    try {
      localStorage.setItem(MODE_STORAGE_KEY, themeMode);
    } catch {
      // ignore
    }
  }, [themeMode, mounted]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const currentTheme =
    THEME_PRESETS.find((p) => p.id === themeColor) || THEME_PRESETS[0];

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        setThemeColor,
        themeMode,
        setThemeMode,
        currentTheme,
        allThemes: THEME_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
