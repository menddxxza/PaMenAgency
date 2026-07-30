import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0b1020',
          soft: '#121a33',
        },
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598cff',
          500: '#3366ff',
          600: '#1f47f5',
          700: '#1a35e1',
          800: '#1c2eb6',
          900: '#1c2e8f',
        },
        accent: {
          400: '#4be3c1',
          500: '#16c79a',
          600: '#0ea47e',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,16,32,0.06), 0 12px 32px -12px rgba(11,16,32,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
