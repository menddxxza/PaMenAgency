'use client';

import { useEffect, useState } from 'react';

const KEY = 'despiece-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    })();
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* modo privado: el tema no persiste, no pasa nada */
    }
  };

  return (
    <button onClick={toggle} className="btn" aria-label="Cambiar tema">
      {theme === 'dark' ? 'Claro' : 'Oscuro'}
    </button>
  );
}
