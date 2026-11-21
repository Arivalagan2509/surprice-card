import { ThemeKey } from "./schema";

export interface ThemeDefinition {
  id: ThemeKey;
  name: string;
  description: string;
  previewColor: string;
  gradient: string;
  accent: string;
  accentLight: string;
  cardBg: string;
  text: string;
  textMuted: string;
  balloonColors: string[];
  confettiColors: string[];
}

export const THEMES: Record<ThemeKey, ThemeDefinition> = {
  sunset: {
    id: "sunset",
    name: "Golden Sunset",
    description: "Warm amber, coral rose, and dusky violet",
    previewColor: "#f97316",
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 25%, #fbcfe8 60%, #e0e7ff 100%)",
    accent: "#ea580c",
    accentLight: "#ffedd5",
    cardBg: "rgba(255, 255, 255, 0.94)",
    text: "#431407",
    textMuted: "#78350f",
    balloonColors: ["#f97316", "#ef4444", "#f59e0b", "#ec4899"],
    confettiColors: ["#f97316", "#ef4444", "#fbbf24", "#ec4899", "#a855f7"],
  },
  garden: {
    id: "garden",
    name: "Lush Garden",
    description: "Fresh sage, mint dew, and botanical warmth",
    previewColor: "#10b981",
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 35%, #e0e7ff 70%, #fef3c7 100%)",
    accent: "#059669",
    accentLight: "#d1fae5",
    cardBg: "rgba(255, 255, 255, 0.94)",
    text: "#064e3b",
    textMuted: "#047857",
    balloonColors: ["#10b981", "#06b6d4", "#84cc16", "#3b82f6"],
    confettiColors: ["#10b981", "#34d399", "#38bdf8", "#fbbf24", "#a3e635"],
  },
  "pink-cloud": {
    id: "pink-cloud",
    name: "Pink Cloud",
    description: "Dreamy cotton candy, blush pink, and lavender mist",
    previewColor: "#ec4899",
    gradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #ede9fe 70%, #fee2e2 100%)",
    accent: "#db2777",
    accentLight: "#fce7f3",
    cardBg: "rgba(255, 255, 255, 0.94)",
    text: "#701a75",
    textMuted: "#9d174d",
    balloonColors: ["#ec4899", "#f43f5e", "#a855f7", "#fb7185"],
    confettiColors: ["#ec4899", "#f43f5e", "#c084fc", "#fb7185", "#ffd166"],
  },
};

export function getThemeStyles(themeKey: ThemeKey = "pink-cloud"): React.CSSProperties {
  const theme = THEMES[themeKey] || THEMES["pink-cloud"];
  return {
    "--theme-gradient": theme.gradient,
    "--theme-accent": theme.accent,
    "--theme-accent-light": theme.accentLight,
    "--theme-card-bg": theme.cardBg,
    "--theme-text": theme.text,
    "--theme-text-muted": theme.textMuted,
  } as React.CSSProperties;
}
