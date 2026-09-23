/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tn: {
          dark: '#0a0f1d',
          card: '#111827',
          sidebar: '#070b14',
          border: '#1f293d',
          accent: '#2563eb',
          accentHover: '#1d4ed8'
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          elevated: '#f97316',
          high: '#ef4444',
          veryHigh: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
