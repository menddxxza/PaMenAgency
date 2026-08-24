import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1240px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        'surface-hover': 'hsl(var(--surface-hover))',
        fg: 'hsl(var(--fg))',
        muted: 'hsl(var(--muted))',
        // Verde esmeralda — color primario de marca (hoja del logo Nexorai).
        brand: {
          50: '#eafbf3',
          100: '#cdf5e2',
          200: '#9de9c8',
          300: '#66d6a8',
          400: '#39bd8a',
          500: '#1f9c6f',
          600: '#167a58',
          700: '#135f46',
          800: '#124a38',
          900: '#0f3c2e',
        },
        // Oro — acento secundario (trenza dorada del logo), reservado para
        // detalles de alto valor: precios, resultados, plan premium.
        gold: {
          50: '#faf6ea',
          100: '#f1e5c4',
          200: '#e4cf94',
          300: '#d4b968',
          400: '#c9a24d',
          500: '#b48a37',
          600: '#93702c',
          700: '#725625',
          800: '#5a4520',
          900: '#4a391d',
        },
        success: '#3ecf8e',
        warning: '#e0ac4c',
        danger: '#e15b5b',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.24), 0 1px 3px 0 rgb(0 0 0 / 0.28)',
        'card-hover': '0 8px 24px -6px rgb(0 0 0 / 0.45)',
        glow: '0 0 0 1px rgb(31 156 111 / 0.25), 0 8px 28px -10px rgb(31 156 111 / 0.45)',
        'glow-gold': '0 0 0 1px rgb(201 162 77 / 0.3), 0 8px 28px -10px rgb(201 162 77 / 0.4)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        in: 'cubic-bezier(0.7, 0, 0.84, 0)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'signal-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.9)' },
        },
        'trace-flow': {
          '0%': { strokeDashoffset: '240' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'signal-pulse': 'signal-pulse 2.6s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        'trace-flow': 'trace-flow 2.4s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
