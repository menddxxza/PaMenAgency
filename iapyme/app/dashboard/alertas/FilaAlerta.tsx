'use client';

import { useState, useTransition } from 'react';
import type { AlertaBusqueda, ProductType } from '@/lib/database.types';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import { alternarAlerta, eliminarAlerta } from './actions';

/** A partir de la lista de `tipos` guardada, adivina qué familia se eligió. */
function nombreFamilia(tipos: string[]): string | null {
  if (tipos.length === 0) return null;
  // Todas las familias salvo "soluciones" tienen un único tipo, así que basta
  // con mirar el primero; "soluciones" es la única con varios.
  const primerTipo = tipos[0] as ProductType;
  return FAMILIAS.find((f) => f.tipos.includes(primerTipo))?.nombre ?? null;
}

export default function FilaAlerta({ alerta }: { alerta: AlertaBusqueda }) {
  const [pendiente, iniciarTransicion] = useTransition();
  const [borrada, setBorrada] = useState(false);
  const familia = nombreFamilia(alerta.tipos);

  const partes = [
    alerta.termino ? `"${alerta.termino}"` : null,
    familia,
    alerta.provincia,
  ].filter(Boolean);

  if (borrada) return null;

  return (
    <li className="card flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {partes.length > 0 ? partes.join(' · ') : 'Cualquier publicación nueva'}
        </p>
        <p className="mt-0.5 text-xs text-ink/50">
          {alerta.activa ? 'Activa' : 'Pausada'} · creada el{' '}
          {new Date(alerta.created_at).toLocaleDateString('es-ES')}
        </p>
      </div>

      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          iniciarTransicion(async () => {
            await alternarAlerta(alerta.id, !alerta.activa);
          })
        }
        className="text-sm font-semibold text-brand-600 hover:underline disabled:opacity-50"
      >
        {alerta.activa ? 'Pausar' : 'Reactivar'}
      </button>

      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          iniciarTransicion(async () => {
            const resultado = await eliminarAlerta(alerta.id);
            if (resultado.ok) setBorrada(true);
          })
        }
        className="text-sm font-semibold text-ink/50 hover:text-red-600 disabled:opacity-50"
      >
        Borrar
      </button>
    </li>
  );
}
