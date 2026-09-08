import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fc",
          400: "#36abf8",
          500: "#0c8ee9",
          600: "#0270c7",
          700: "#0359a1",
          800: "#074c84",
          900: "#0b406e",
          950: "#082849",
        },
        industry: {
          dark: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          accent: "#f59e0b",
        }
      },
    },
  },
  plugins: [],
};
export default config;
