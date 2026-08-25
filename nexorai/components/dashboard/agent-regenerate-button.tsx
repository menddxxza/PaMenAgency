'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AgentRegenerateButton({ agentId, agentName }: { agentId: string; agentName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    const confirmed = window.confirm(
      `¿Volver a generar el plan de trabajo de "${agentName}" con IA? Sustituirá sus tareas actuales.`
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(`/api/agents/${agentId}/regenerate`, { method: 'POST' });
    setLoading(false);
    if (!res.ok) {
      window.alert('No se pudo regenerar el plan del agente. Inténtalo de nuevo.');
      return;
    }
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={handleRegenerate}>
      {!loading && <RotateCw className="h-3.5 w-3.5" />}
      Regenerar plan
    </Button>
  );
}
