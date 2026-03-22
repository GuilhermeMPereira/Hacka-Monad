import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Amber/Gold (valor, mérito, calor)
        primary: {
          DEFAULT: "#E8A317",
          hover: "#C4880D",
          light: "#F5C563",
        },
        // Secondary — Violet (blockchain, tech, confiança)
        secondary: {
          DEFAULT: "#6C5CE7",
          hover: "#5A4BD1",
          light: "#8B7EF0",
        },
        // Backgrounds
        bg: {
          DEFAULT: "#121214",
          surface: "#1C1C22",
          elevated: "#26262E",
        },
        // Borders
        border: {
          DEFAULT: "#2E2E38",
          light: "#3A3A46",
        },
        // Text
        text: {
          primary: "#F0EDE8",
          secondary: "#9B9590",
          muted: "#5C5A65",
        },
        // Semantic
        success: "#36D399",
        error: "#F87272",
        warning: "#FBBD23",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(232, 163, 23, 0.10)",
        "glow-violet": "0 0 20px rgba(108, 92, 231, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
