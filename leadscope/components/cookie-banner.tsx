'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  COOKIE_CONSENT_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
  getCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  function choose(value: CookieConsent) {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      // Sin almacenamiento disponible: la decisión solo vale para esta visita.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-3 bottom-3 z-[9990] max-w-md animate-slide-up rounded-2xl border border-border bg-surface p-5 shadow-card-hover sm:inset-x-auto sm:bottom-5 sm:left-5"
    >
      <div className="flex items-center gap-2 font-display text-sm font-semibold text-fg">
        <Cookie className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        Tu privacidad
      </div>
      <p className="mt-2 text-sm text-muted">
        Usamos cookies necesarias para que inicies sesión y funcione el panel. Las opcionales
        (por ejemplo, de medición) solo se activarían si las aceptas. Puedes cambiarlo cuando
        quieras desde «Configurar cookies». Más información en la{' '}
        <Link href="/legal/cookies" className="underline underline-offset-2 hover:text-fg">
          política de cookies
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => choose('rejected')}>
          Rechazar
        </Button>
        <Button variant="brand" size="sm" className="flex-1" onClick={() => choose('accepted')}>
          Aceptar
        </Button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
    >
      Configurar cookies
    </button>
  );
}
