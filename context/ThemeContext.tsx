"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
  brand: string;
  setBrand: (color: string) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
  brand: "#15da57",
  setBrand: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [brand, setBrandState] = useState("#15da57");

  // Cargar desde localStorage al inicio
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as Theme | null;
    const savedBrand = localStorage.getItem("brand-color");

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
    if (savedBrand) {
      setBrandState(savedBrand);
      document.documentElement.style.setProperty("--brand", savedBrand);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("app-theme", next);
      applyTheme(next);
      return next;
    });
  };

  const setBrand = (color: string) => {
    setBrandState(color);
    localStorage.setItem("brand-color", color);
    document.documentElement.style.setProperty("--brand", color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, brand, setBrand }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.classList.toggle("light", t === "light");
}

export const useTheme = () => useContext(ThemeContext);
