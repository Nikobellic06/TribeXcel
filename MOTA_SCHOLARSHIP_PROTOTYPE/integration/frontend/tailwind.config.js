/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mota: {
          dark: '#0f172a',
          primary: '#1e3a8a',
          accent: '#b45309',
          gold: '#f59e0b',
          surface: '#f8fafc',
          border: '#e2e8f0'
        }
      }
    },
  },
  plugins: [],
}
