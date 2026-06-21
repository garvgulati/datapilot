import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        nav: "#101828",
        steel: "#344054",
        mint: "#087f73",
        signal: "#c2410c",
        amber: "#b7791f",
        surface: "#f3f6fa"
      },
      boxShadow: {
        soft: "0 12px 28px rgba(15, 23, 42, 0.07)",
        nav: "14px 0 32px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
