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
        ofrenda: {
          orange: "#FF7518",
          amber: "#FFB020",
          marigold: "#F59E0B",
          cempasuchil: "#D97706",
          dark: "#0C0A09",
          altar: "#1C1917",
          candle: "#FEF08A",
          papel: "#EC4899",
          spectral: "#38BDF8"
        }
      },
      animation: {
        flicker: "flicker 3s infinite ease-in-out",
        float: "float 6s infinite ease-in-out",
        pulseGlow: "pulseGlow 2.5s infinite ease-in-out"
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 10px #FF7518)" },
          "50%": { opacity: "0.82", filter: "drop-shadow(0 0 5px #F59E0B)" },
          "25%": { opacity: "0.92", filter: "drop-shadow(0 0 15px #FFB020)" },
          "75%": { opacity: "0.88", filter: "drop-shadow(0 0 8px #FF7518)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)" },
          "50%": { boxShadow: "0 0 35px rgba(245, 158, 11, 0.6)" }
        }
      }
    },
  },
  plugins: [],
};
export default config;
