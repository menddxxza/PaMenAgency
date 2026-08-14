'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { LeadStatus } from '@/lib/database.types';
import { cambiarEstadoLead } from '@/app/dashboard/leads/actions';

const ETIQUETAS: Record<LeadStatus, { texto: string; clase: string }> = {
  new: { texto: 'Sin responder', clase: 'bg-amber-100 text-amber-800' },
  contacted: { texto: 'Contactado', clase: 'bg-brand-50 text-brand-700' },
  converted: { texto: 'Vendido', clase: 'bg-accent-500/15 text-accent-700' },
  discarded: { texto: 'Descartado', clase: 'bg-ink/[0.06] text-ink/45' },
};

const ORDEN: LeadStatus[] = ['new', 'contacted', 'converted', 'discarded'];

export default function EstadoLead({ id, status }: { id: string; status: LeadStatus }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function cambiar(nuevo: LeadStatus) {
    setAbierto(false);
    startTransition(async () => {
      await cambiarEstadoLead(id, nuevo);
      router.refresh();
    });
  }

  const etiqueta = ETIQUETAS[status];

  return (
    <span className="relative inline-block">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => setAbierto(!abierto)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={`rounded-md px-2 py-1 text-xs font-bold transition hover:opacity-80 ${etiqueta.clase}`}
      >
        {pendiente ? '…' : etiqueta.texto} ▾
      </button>

      {abierto ? (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-card"
        >
          {ORDEN.map((valor) => (
            <li key={valor}>
              <button
                type="button"
                role="option"
                aria-selected={valor === status}
                onClick={() => cambiar(valor)}
                className={`block w-full px-3 py-2 text-left text-xs hover:bg-ink/[0.04] ${
                  valor === status ? 'font-bold' : ''
                }`}
              >
                {ETIQUETAS[valor].texto}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}
