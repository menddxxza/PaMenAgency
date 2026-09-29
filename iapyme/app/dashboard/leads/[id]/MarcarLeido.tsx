'use client';

import { useEffect } from 'react';
import { marcarConversacionLeida } from '@/app/dashboard/leads/actions';

/**
 * Sin interfaz propia: al abrir el hilo, marca como leídos los mensajes que
 * ha escrito la otra parte. Vive aparte del Server Component de la página
 * porque escribir en la base de datos durante el render de un Server
 * Component no está permitido — esto se dispara en el cliente, una vez.
 */
export default function MarcarLeido({ leadId }: { leadId: string }) {
  useEffect(() => {
    marcarConversacionLeida(leadId);
  }, [leadId]);

  return null;
}
