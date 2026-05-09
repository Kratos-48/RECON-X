/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "recon-surface": "var(--color-surface)",
        "recon-surface-container": "var(--color-surface-container)",
        "recon-primary": "var(--color-primary)",
        "recon-on-surface": "var(--color-on-surface)",
        "recon-on-surface-variant": "var(--color-on-surface-variant)",
        "recon-outline": "var(--color-outline)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["forest"],
  },
};