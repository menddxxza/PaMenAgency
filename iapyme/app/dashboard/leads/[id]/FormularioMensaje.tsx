'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { enviarMensaje } from '@/app/dashboard/leads/actions';

export default function FormularioMensaje({ leadId }: { leadId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="sticky bottom-4 mt-6">
      {error ? <p className="mb-2 text-xs font-medium text-red-600">{error}</p> : null}

      <form
        ref={formRef}
        action={(formData) => {
          setError(null);
          const cuerpo = String(formData.get('cuerpo') ?? '');
          startTransition(async () => {
            const resultado = await enviarMensaje(leadId, cuerpo);
            if (resultado.ok) {
              formRef.current?.reset();
              router.refresh();
            } else {
              setError(resultado.error);
            }
          });
        }}
        className="flex items-end gap-2 rounded-2xl border border-ink/10 bg-white p-2 shadow-lift"
      >
        <textarea
          name="cuerpo"
          required
          rows={1}
          maxLength={4000}
          placeholder="Escribe una respuesta…"
          className="max-h-40 flex-1 resize-none rounded-xl border-0 bg-transparent px-3 py-2.5 text-sm
                     text-ink placeholder:text-ink/40 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={pendiente}
          className="btn-primary shrink-0 py-2.5 disabled:opacity-60"
        >
          {pendiente ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
