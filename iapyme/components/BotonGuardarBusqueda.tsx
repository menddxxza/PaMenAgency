'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { crearAlerta } from '@/app/dashboard/alertas/actions';
import Icono from './Icono';

/**
 * "Avísame de esto": convierte la búsqueda que se está viendo ahora mismo en
 * una alerta, sin que el usuario tenga que ir a rellenar el formulario de
 * /dashboard/alertas a mano con los mismos criterios que ya ha escrito aquí.
 */
export default function BotonGuardarBusqueda() {
  const searchParams = useSearchParams();
  const [estado, setEstado] = useState<'idle' | 'guardando' | 'ok' | { error: string }>('idle');

  const q = searchParams.get('q') ?? '';
  const familia = searchParams.get('familia') ?? '';
  const provincia = searchParams.get('provincia') ?? '';

  if (!q && !familia && !provincia) return null;

  if (estado === 'ok') {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-700">
        <Icono nombre="check" className="h-4 w-4" />
        Te avisaremos por email
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={estado === 'guardando'}
        onClick={async () => {
          setEstado('guardando');
          const datos = new FormData();
          datos.set('termino', q);
          datos.set('familia', familia);
          datos.set('provincia', provincia);
          const resultado = await crearAlerta(datos);
          setEstado(resultado.ok ? 'ok' : { error: resultado.error });
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700
                   transition-colors hover:text-brand-800 disabled:opacity-60"
      >
        <Icono nombre="campana" className="h-4 w-4" />
        {estado === 'guardando' ? 'Guardando…' : 'Avisarme de esto'}
      </button>

      {typeof estado === 'object' ? (
        <p className="mt-1 text-xs text-red-600">{estado.error}</p>
      ) : null}
    </div>
  );
}
