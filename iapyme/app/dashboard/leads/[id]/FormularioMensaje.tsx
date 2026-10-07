'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { enviarMensaje } from '@/app/dashboard/leads/actions';
import { codificarOferta } from '@/lib/formato';
import RespuestasRapidas from '@/components/RespuestasRapidas';

export default function FormularioMensaje({ leadId }: { leadId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [conOferta, setConOferta] = useState(false);

  return (
    <div className="sticky bottom-4 mt-6">
      {error ? <p className="mb-2 text-xs font-medium text-red-600">{error}</p> : null}

      <form
        ref={formRef}
        action={(formData) => {
          setError(null);
          const texto = String(formData.get('cuerpo') ?? '');
          const precio = Number(formData.get('precio'));
          const cuerpo =
            conOferta && Number.isFinite(precio) && precio > 0
              ? codificarOferta(precio, texto)
              : texto;

          startTransition(async () => {
            const resultado = await enviarMensaje(leadId, cuerpo);
            if (resultado.ok) {
              formRef.current?.reset();
              setConOferta(false);
              router.refresh();
            } else {
              setError(resultado.error);
            }
          });
        }}
        className="rounded-2xl border border-ink/10 bg-white p-2 shadow-lift"
      >
        {conOferta ? (
          <div className="flex items-center gap-2 border-b border-ink/10 px-2 pb-2">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-ink/70">
              💶 Propones
              <input
                name="precio"
                type="number"
                min={1}
                step={1}
                autoFocus
                placeholder="150"
                className="w-24 rounded-lg border border-ink/15 px-2 py-1 text-sm outline-none
                           focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              €
            </label>
            <button
              type="button"
              onClick={() => setConOferta(false)}
              className="ml-auto text-xs font-medium text-ink/50 hover:text-ink"
            >
              Quitar oferta
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2 pt-2">
          {!conOferta ? (
            <button
              type="button"
              onClick={() => setConOferta(true)}
              title="Proponer un precio"
              className="mb-0.5 shrink-0 rounded-xl px-2.5 py-2.5 text-lg transition hover:bg-ink/[0.05]"
            >
              💶
            </button>
          ) : null}

          <RespuestasRapidas
            onElegir={(texto) => {
              if (!textareaRef.current) return;
              textareaRef.current.value = texto;
              textareaRef.current.focus();
            }}
          />

          <textarea
            ref={textareaRef}
            name="cuerpo"
            required
            rows={1}
            maxLength={4000}
            placeholder={conOferta ? 'Añade algo de contexto a tu oferta…' : 'Escribe una respuesta…'}
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
        </div>
      </form>
    </div>
  );
}
