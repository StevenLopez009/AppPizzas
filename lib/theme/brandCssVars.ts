export const DEFAULT_THEME_PRIMARY = "#f97316";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, "").trim();
  if (h.length !== 6 || !/^[0-9a-fA-F]+$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

function mixRgb(
  r: number,
  g: number,
  b: number,
  tr: number,
  tg: number,
  tb: number,
  t: number,
): [number, number, number] {
  return [
    r + (tr - r) * t,
    g + (tg - g) * t,
    b + (tb - b) * t,
  ];
}

/** Genera variables CSS --app-* a partir de un color principal (#RRGGBB). */
export function buildBrandCssVars(hex: string): Record<string, string> {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const rgb = hexToRgb(normalized);
  if (!rgb) {
    return buildBrandCssVars(DEFAULT_THEME_PRIMARY);
  }
  const { r, g, b } = rgb;

  const hover = mixRgb(r, g, b, 0, 0, 0, 0.14);
  const active = mixRgb(r, g, b, 0, 0, 0, 0.24);
  const surface = mixRgb(r, g, b, 255, 255, 255, 0.93);
  const surfaceMuted = mixRgb(r, g, b, 255, 255, 255, 0.86);
  const ring = mixRgb(r, g, b, 255, 255, 255, 0.42);
  const text = mixRgb(r, g, b, 0, 0, 0, 0.12);
  const textStrong = mixRgb(r, g, b, 0, 0, 0, 0.22);

  return {
    "--app-brand": rgbToHex(r, g, b),
    "--app-brand-hover": rgbToHex(hover[0], hover[1], hover[2]),
    "--app-brand-active": rgbToHex(active[0], active[1], active[2]),
    "--app-brand-foreground": "#ffffff",
    "--app-brand-surface": rgbToHex(surface[0], surface[1], surface[2]),
    "--app-brand-surface-muted": rgbToHex(
      surfaceMuted[0],
      surfaceMuted[1],
      surfaceMuted[2],
    ),
    "--app-brand-ring": rgbToHex(ring[0], ring[1], ring[2]),
    "--app-brand-text": rgbToHex(text[0], text[1], text[2]),
    "--app-brand-text-strong": rgbToHex(
      textStrong[0],
      textStrong[1],
      textStrong[2],
    ),
  };
}

export function applyBrandTheme(hex: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = buildBrandCssVars(hex);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
