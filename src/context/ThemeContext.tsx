import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
  isDark: true,
});

// ─── Applique le thème sur <html> — compatible Tailwind dark mode ─────────────
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", theme);
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("app-theme") as Theme | null;
    if (!saved) {
      // Préférence système par défaut
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return saved;
  });

  // Appliquer immédiatement à chaque changement
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // Appliquer au premier rendu (avant paint)
  useEffect(() => { applyTheme(theme); }, []);

  const toggle  = () => setThemeState(t => t === "dark" ? "light" : "dark");
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;