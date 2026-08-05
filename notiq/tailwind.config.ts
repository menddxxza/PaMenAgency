import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#141319',
          soft: '#3c3a45',
        },
        paper: '#faf9f7',
        brand: {
          50: '#f4f1ff',
          100: '#e9e3ff',
          200: '#d5c9ff',
          300: '#b7a1ff',
          400: '#9670ff',
          500: '#7a45f5',
          600: '#6829e0',
          700: '#571fbb',
          800: '#491d98',
          900: '#3d1b7a',
        },
        lima: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,19,25,0.05), 0 12px 32px -14px rgba(20,19,25,0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
