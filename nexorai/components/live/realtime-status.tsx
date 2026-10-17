'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LiveBadge } from '@/components/live/live-badge';

const WATCHED_TABLES = ['agent_tasks', 'leads', 'revenue_events', 'agents', 'opportunities'] as const;

/**
 * Se suscribe a los cambios en vivo (Supabase Realtime) de las tablas que
 * alimentan el dashboard de un negocio, filtrados por su organization_id, y
 * refresca la página cuando algo cambia. RLS aplica igual a las
 * suscripciones Realtime que a cualquier query: este componente nunca
 * recibe eventos de otra organización, así que es seguro correrlo en el
 * navegador con la anon key (a diferencia del panel de admin, que agrega
 * varias organizaciones y necesita service role del lado del servidor).
 */
export function RealtimeStatus({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`org-${organizationId}-live`);

    for (const table of WATCHED_TABLES) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `organization_id=eq.${organizationId}` },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => router.refresh(), 500);
        }
      );
    }

    channel.subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [organizationId, router]);

  return <LiveBadge active={connected} />;
}
