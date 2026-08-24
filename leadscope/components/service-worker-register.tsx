'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Instalación como app sigue disponible aunque el SW falle en registrarse.
      });
    }
  }, []);

  return null;
}
