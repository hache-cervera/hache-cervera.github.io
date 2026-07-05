/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        muted: '#6b6b6b',
        line: '#e5e5e5',
        accent: {
          DEFAULT: '#ff3c00',
          hover: '#e63500',
          soft: '#ffe8e1',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
    },
  },
  plugins: [],
};
