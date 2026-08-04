/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        textMain: 'var(--text)',
        textMuted: 'var(--text-muted)',
        textSoft: 'var(--text-soft)',
        accent: 'var(--accent)',
        accentHover: 'var(--accent-hover)',
        accentSoft: 'var(--accent-soft)',
        borderMain: 'var(--border)',
        borderSoft: 'var(--border-soft)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}