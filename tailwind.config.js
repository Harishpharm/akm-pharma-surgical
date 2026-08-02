
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#10b981', // Pharma/Health
        'brand-blue': '#2563eb',  // Corporate/Surgical
        'brand-grey': '#f1f5f9',  // Backgrounds
        'brand-dark': '#0f172a',  // High-contrast text
        'brand-border': '#e2e8f0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'clinical': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
