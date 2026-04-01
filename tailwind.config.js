/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        accent: "#E63946",
        muted: "#6B7280",
        surface: "#F9FAFB",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      aspectRatio: {
        square: "1 / 1",
      },
    },
  },
  plugins: [],
};