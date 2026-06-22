import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0A0A0A",
          surface: "#141414",
          border: "#242424",
          muted: "#666666",
          text: "#F0F0F0",
          accent: "#FF4D00",
          "accent-muted": "#FF4D0020",
        },
        cream: "#F0EDE4",
        "cream-dark": "#E8E4D9",
        gold: "#C9923A",
        "near-black": "#1A1A1A",
        "gray-body": "#6B6B6B",
        "gray-label": "#999999",
        "card-bg": "#FAFAF7",
        "panel-bg": "#F5F2EB",
        native: {
          black: "#111111",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-instrument)", "serif"],
        playfair: ["var(--font-playfair)", "Playfair Display", "serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        polaroid: "0 8px 32px rgba(0, 0, 0, 0.15)",
        card: "0 2px 12px rgba(0, 0, 0, 0.07)",
        cookie: "0 4px 24px rgba(0, 0, 0, 0.12)",
      },
      keyframes: {
        carousel: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        carousel: "carousel 50s linear infinite",
      },
    },
  },
};

export default config;
