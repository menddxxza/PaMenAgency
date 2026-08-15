import type { Config } from 'tailwindcss';

/**
 * Paleta en OKLCH. Los valores son la conversión exacta de los hex originales
 * de marca, así que el azul de IAPyme no cambia: solo pasa a un espacio de
 * color donde las mezclas y los estados hover no se ensucian.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'oklch(17.7% 0.034 269.6 / <alpha-value>)',
          soft: 'oklch(22.5% 0.050 268.8 / <alpha-value>)',
        },
        brand: {
          50: 'oklch(96.6% 0.016 262.8 / <alpha-value>)',
          100: 'oklch(92.4% 0.036 265.1 / <alpha-value>)',
          200: 'oklch(86.2% 0.067 264.5 / <alpha-value>)',
          300: 'oklch(77.2% 0.116 263.3 / <alpha-value>)',
          400: 'oklch(66.1% 0.179 264.1 / <alpha-value>)',
          500: 'oklch(57.3% 0.234 265.3 / <alpha-value>)',
          600: 'oklch(50.5% 0.259 265.7 / <alpha-value>)',
          700: 'oklch(45.7% 0.254 266.2 / <alpha-value>)',
          800: 'oklch(40.0% 0.210 267.7 / <alpha-value>)',
          900: 'oklch(35.9% 0.160 268.3 / <alpha-value>)',
        },
        accent: {
          400: 'oklch(82.8% 0.136 174.7 / <alpha-value>)',
          500: 'oklch(73.9% 0.145 168.7 / <alpha-value>)',
          600: 'oklch(64.0% 0.126 168.6 / <alpha-value>)',
          // El 600 sobre menta claro se queda en 3.2:1. Este paso existe para
          // el texto verde sobre fondos claros, donde hace falta 4.5:1.
          700: 'oklch(50.0% 0.105 168.6 / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Escala de display para titulares; el resto sigue la escala de Tailwind.
        // Tracking mucho menos negativo que una grotesk: una serif de alto
        // contraste se cierra sola, apretarla la vuelve ilegible.
        'display-s': ['clamp(2.1rem, 1.5rem + 2.6vw, 3.1rem)', { lineHeight: '1.1', letterSpacing: '-0.012em' }],
        // Tope en 3.75rem: por encima de eso el titular de portada rompe en
        // tres líneas dentro de su columna y deja una palabra huérfana.
        display: ['clamp(2.4rem, 1.7rem + 3vw, 3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
      },
      transitionTimingFunction: {
        // Tres curvas nombradas. Nunca el `ease` por defecto del navegador.
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        in: 'cubic-bezier(0.7, 0, 0.84, 0)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        fast: '140ms',
        base: '220ms',
        slow: '420ms',
      },
      boxShadow: {
        // Ambiental, casi imperceptible: la superficie se separa del papel
        // por una sombra que se nota al mirarla, no al pasar por delante.
        quiet: '0 1px 2px oklch(17.7% 0.034 269.6 / 0.04), 0 8px 24px -14px oklch(17.7% 0.034 269.6 / 0.14)',
        lift: '0 4px 10px -4px oklch(17.7% 0.034 269.6 / 0.08), 0 24px 48px -20px oklch(17.7% 0.034 269.6 / 0.22)',
        // Mantenido por compatibilidad con usos existentes fuera de la portada.
        card: '0 1px 2px oklch(17.7% 0.034 269.6 / 0.06), 0 12px 32px -12px oklch(17.7% 0.034 269.6 / 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
