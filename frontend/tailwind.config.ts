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
        background: "var(--bg-app)",
        foreground: "var(--text-primary)",
        card: "var(--bg-card)",
        surface: "var(--bg-surface)",
        "surface-hover": "var(--bg-surface-hover)",
        "surface-active": "var(--bg-surface-active)",
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
        },
        gold: "var(--accent-gold)",
        emerald: "var(--accent-emerald)",
        rose: "var(--accent-rose)",
        cyan: "var(--accent-cyan)",
        purple: "var(--accent-purple)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
        "gold-glow": "var(--shadow-gold-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
