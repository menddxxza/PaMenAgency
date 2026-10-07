'use client';

import { useState } from 'react';
import Icono from './Icono';

/**
 * "Ver teléfono" al estilo Milanuncios: oculto hasta que se pulsa, en vez de
 * escrito tal cual en el HTML. No es una barrera real (el teléfono ya viaja
 * en la respuesta del servidor), pero sí evita que raspadores simples lo
 * recojan de forma automática sin que nadie lo haya pedido, y dejar un paso
 * de más antes de mostrarlo invita a usarlo con intención, no de pasada.
 */
export default function VerTelefono({ telefono }: { telefono: string }) {
  const [visible, setVisible] = useState(false);

  if (visible) {
    return (
      <a href={`tel:${telefono.replace(/[^\d+]/g, '')}`} className="btn-secondary w-full">
        <Icono nombre="telefono" className="h-4 w-4" />
        {telefono}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => setVisible(true)} className="btn-secondary w-full">
      <Icono nombre="telefono" className="h-4 w-4" />
      Ver teléfono
    </button>
  );
}
