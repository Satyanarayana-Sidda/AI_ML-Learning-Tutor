/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "var(--color-base)",
          panel: "var(--color-base-panel)",
          raised: "var(--color-base-raised)",
        },
        accent: {
          orange: "var(--color-accent-orange)",
          peach: "var(--color-accent-peach)",
          brown: "var(--color-accent-brown)",
          blue: "var(--color-accent-blue)",
        },
        text: {
          primary: "var(--color-text-primary)",
          muted: "var(--color-text-muted)",
          faint: "var(--color-text-faint)",
        },
        border: {
          glass: "var(--color-border-glass)",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "none",
        "gradient-glow": "none",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        glow: "none",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
