'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LiveBadge } from '@/components/live/live-badge';

/**
 * Refresca la página (re-ejecuta el Server Component) cada `intervalMs`.
 * Pensado para vistas que agregan datos de varias organizaciones (panel de
 * admin), donde Supabase Realtime no es una opción segura desde el
 * navegador (exigiría exponer privilegios por encima de RLS al cliente).
 */
export function PollRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return <LiveBadge active label={`En vivo · cada ${Math.round(intervalMs / 1000)}s`} />;
}
