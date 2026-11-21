import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        themeAccent: "var(--theme-accent, #f43f5e)",
        themeAccentLight: "var(--theme-accent-light, #fecdd3)",
        themeCardBg: "var(--theme-card-bg, rgba(255, 255, 255, 0.95))",
        themeText: "var(--theme-text, #1e293b)",
        themeTextMuted: "var(--theme-text-muted, #64748b)",
      },
      fontFamily: {
        sans: ["var(--font-sans, system-ui, -apple-system, sans-serif)"],
        handwriting: ["var(--font-handwriting, 'Caveat', cursive)"],
        heading: ["var(--font-heading, system-ui, -apple-system, sans-serif)"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
