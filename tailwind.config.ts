import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#18A5A8",
        "primary-deep": "#087D82",
        "teal-dark": "#123E40",
        aqua: "#DDF7F5",
        bg: "#F7FCFC",
        gold: "#C9A646",
        muted: "#5D7475",
        border: "#D8ECEB"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
        urdu: ["var(--font-urdu)", "serif"]
      },
      borderRadius: {
        card: "20px"
      },
      boxShadow: {
        card: "0 8px 30px -12px rgba(18, 62, 64, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
