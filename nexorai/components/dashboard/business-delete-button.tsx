'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BusinessDeleteButton({ businessId, businessName }: { businessId: string; businessName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar "${businessName}"? Se borrarán también sus objetivos, oportunidades y campañas. Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(`/api/businesses/${businessId}`, { method: 'DELETE' });
    setLoading(false);
    if (!res.ok) {
      window.alert('No se pudo eliminar el negocio. Inténtalo de nuevo.');
      return;
    }
    router.refresh();
  }

  return (
    <Button variant="danger" size="icon" loading={loading} onClick={handleDelete} aria-label={`Eliminar ${businessName}`}>
      {!loading && <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
