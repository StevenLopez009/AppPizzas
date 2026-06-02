"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  className?: string;
  iconOnly?: boolean;
}

export default function ThemeToggle({ className = "", iconOnly = false }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (iconOnly) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
          bg-surface-muted text-fg-subtle hover:bg-line hover:text-fg ${className}`}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all
        text-fg-subtle hover:bg-surface-muted hover:text-fg-muted ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
    </button>
  );
}
