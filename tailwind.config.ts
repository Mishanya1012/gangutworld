import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0B1020",
        neonPink: "#F04BA5",
        neonPurple: "#B65EFF",
        panel: "rgba(255,255,255,0.08)"
      },
      boxShadow: {
        neon: "0 0 32px rgba(240,75,165,0.35)",
        purple: "0 0 36px rgba(182,94,255,0.25)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
