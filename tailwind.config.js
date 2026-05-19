/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7b97fb',
          500: '#5b73f7',
          600: '#4153ec',
          700: '#3440d1',
          800: '#2b35a8',
          900: '#283285',
          950: '#1a1f52',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8f9fc',
          border:  '#e8ecf4',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        elevated: '0 4px 24px -4px rgba(59,65,200,.14)',
      },
    },
  },
  plugins: [],
}
