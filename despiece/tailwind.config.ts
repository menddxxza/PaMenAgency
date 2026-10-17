import type { Config } from 'tailwindcss';

// Los tokens viven en app/globals.css (mismos valores que el prototipo).
// Aquí solo se exponen a Tailwind. Sin gradientes ni sombras de color:
// es una herramienta de ingeniería, no un SaaS.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        ok: 'var(--ok)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { none: '0', sm: '2px', DEFAULT: '3px' },
    },
  },
  plugins: [],
};

export default config;
