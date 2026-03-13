/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
        },
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        educational: "0 8px 32px rgba(31, 38, 135, 0.15)",
      },
    },
  },
  plugins: [],
};
