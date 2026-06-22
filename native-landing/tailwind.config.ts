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
        fadeDrop: {
          "0%": { opacity: "0", transform: "translateY(-36px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        carousel: "carousel 50s linear infinite",
        "fade-drop": "fadeDrop 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-drop-delay-1": "fadeDrop 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.14s both",
        "fade-drop-delay-2": "fadeDrop 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both",
        "fade-drop-delay-3": "fadeDrop 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.42s both",
        "fade-drop-delay-4": "fadeDrop 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.56s both",
      },
    },
  },
  plugins: [],
};

export default config;
