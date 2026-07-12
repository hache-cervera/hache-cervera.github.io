/** @type {import('tailwindcss').Config} */
export default {
  content: ['./web/index.html', './web/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0e1116',
        surface: '#161b22',
        'surface-2': '#1c232d',
        border: '#2a323d',
        text: '#e6edf3',
        muted: '#8b949e',
        primary: { DEFAULT: '#2f81f7', hover: '#4c93f8' },
        ok: '#3fb950',
        warn: '#d29922',
        danger: '#f85149',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { card: '10px' },
    },
  },
  plugins: [],
};
