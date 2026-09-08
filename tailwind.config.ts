import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: {
          50: "rgb(var(--theme-50, 239 246 255) / <alpha-value>)",
          100: "rgb(var(--theme-100, 219 234 254) / <alpha-value>)",
          200: "rgb(var(--theme-200, 191 219 254) / <alpha-value>)",
          300: "rgb(var(--theme-300, 147 197 253) / <alpha-value>)",
          400: "rgb(var(--theme-400, 96 165 250) / <alpha-value>)",
          500: "rgb(var(--theme-500, 59 130 246) / <alpha-value>)",
          600: "rgb(var(--theme-600, 37 99 235) / <alpha-value>)",
          700: "rgb(var(--theme-700, 29 78 216) / <alpha-value>)",
          800: "rgb(var(--theme-800, 30 64 175) / <alpha-value>)",
          900: "rgb(var(--theme-900, 30 58 138) / <alpha-value>)",
          950: "rgb(var(--theme-950, 23 37 84) / <alpha-value>)",
        },
        primary: {
          50: "rgb(var(--theme-50, 239 246 255) / <alpha-value>)",
          100: "rgb(var(--theme-100, 219 234 254) / <alpha-value>)",
          200: "rgb(var(--theme-200, 191 219 254) / <alpha-value>)",
          300: "rgb(var(--theme-300, 147 197 253) / <alpha-value>)",
          400: "rgb(var(--theme-400, 96 165 250) / <alpha-value>)",
          500: "rgb(var(--theme-500, 59 130 246) / <alpha-value>)",
          600: "rgb(var(--theme-600, 37 99 235) / <alpha-value>)",
          700: "rgb(var(--theme-700, 29 78 216) / <alpha-value>)",
          800: "rgb(var(--theme-800, 30 64 175) / <alpha-value>)",
          900: "rgb(var(--theme-900, 30 58 138) / <alpha-value>)",
          950: "rgb(var(--theme-950, 23 37 84) / <alpha-value>)",
          DEFAULT: "rgb(var(--theme-600, 37 99 235) / <alpha-value>)",
        },
        brand: {
          50: "rgb(var(--theme-50, 239 246 255) / <alpha-value>)",
          100: "rgb(var(--theme-100, 219 234 254) / <alpha-value>)",
          200: "rgb(var(--theme-200, 191 219 254) / <alpha-value>)",
          300: "rgb(var(--theme-300, 147 197 253) / <alpha-value>)",
          400: "rgb(var(--theme-400, 96 165 250) / <alpha-value>)",
          500: "rgb(var(--theme-500, 59 130 246) / <alpha-value>)",
          600: "rgb(var(--theme-600, 37 99 235) / <alpha-value>)",
          700: "rgb(var(--theme-700, 29 78 216) / <alpha-value>)",
          800: "rgb(var(--theme-800, 30 64 175) / <alpha-value>)",
          900: "rgb(var(--theme-900, 30 58 138) / <alpha-value>)",
          950: "rgb(var(--theme-950, 23 37 84) / <alpha-value>)",
        },
        industry: {
          dark: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          accent: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
