"use client";

/**
 * ThemeProvider — React-19-safe dark/light theme manager.
 *
 * Replaces next-themes entirely to avoid the React 19 warning:
 *   "Encountered a script tag while rendering React component."
 *
 * Strategy:
 *  - On mount, reads the saved theme from localStorage (or falls back to
 *    the OS preference when theme === "system").
 *  - Writes the "dark" or "light" class directly on <html>.
 *  - Exposes { theme, resolvedTheme, setTheme } via ThemeContext.
 *  - The public API is a drop-in for the next-themes useTheme() hook.
 */

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

const STORAGE_KEY = "sprout-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  // On mount: read persisted preference
  React.useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    const resolved = saved === "system" ? getSystemTheme() : saved;
    setThemeState(saved);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Track OS preference changes when theme === "system"
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function setTheme(t: Theme) {
    const resolved = t === "system" ? getSystemTheme() : t;
    setThemeState(t);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* quota full */ }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
