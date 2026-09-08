import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ink/paper/surface salen de variables CSS (ver globals.css) y no de un hex
        // fijo, para que el modo oscuro (clase .dark en <html>) los invierta sin
        // tocar ni una clase de componente: cambia la variable, no la utilidad.
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
        },
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
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
