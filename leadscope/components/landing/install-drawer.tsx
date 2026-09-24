'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const SEEN_KEY = 'leadscope-install-seen';

export function InstallDrawer() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setStandalone(installed);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    if (installed) return;

    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      // sin almacenamiento: se muestra siempre plegado
    }
    if (seen) return;
    const timer = setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(SEEN_KEY, '1');
      } catch {
        // ignorado
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (standalone) return null;

  return (
    <aside
      aria-label="Instalar la app"
      className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-stretch transition-transform duration-500 ease-out"
      style={{ transform: `translateY(-50%) translateX(${open ? '0' : 'calc(100% - 44px)'})` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-11 flex-col items-center justify-center gap-2 rounded-l-xl border border-r-0 border-border bg-brand-500 py-4 text-white shadow-card-hover transition-colors hover:bg-brand-600"
      >
        <Download className="h-4 w-4" />
        <span className="text-xs font-semibold tracking-wide [writing-mode:vertical-rl]">
          Instalar app
        </span>
      </button>

      <div className="w-[min(288px,78vw)] border-y border-l border-border bg-surface p-5 shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-fg">Llévate LeadScope</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="text-muted hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Ábrela como una app, a pantalla completa y con acceso directo desde tu escritorio o tu
          pantalla de inicio.
        </p>

        {canInstall ? (
          <Button variant="brand" className="mt-4 w-full" onClick={promptInstall}>
            <Download className="h-4 w-4" />
            Instalar ahora
          </Button>
        ) : isIos ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-hover p-3 text-xs text-fg">
            <Share className="mt-0.5 h-4 w-4 shrink-0" />
            En Safari pulsa Compartir y elige «Añadir a pantalla de inicio».
          </p>
        ) : (
          <p className="mt-4 rounded-lg bg-surface-hover p-3 text-xs text-fg">
            En Chrome o Edge abre el menú del navegador y elige «Instalar LeadScope».
          </p>
        )}
      </div>
    </aside>
  );
}
