'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: '¿De dónde salen los datos de los negocios?',
    a: 'De Google Places API, en tiempo real, y de la propia web pública de cada negocio para comprobar si existe, está rota o solo tiene redes sociales. No hacemos scraping de Google Maps.',
  },
  {
    q: '¿En qué países funciona?',
    a: 'En cualquiera donde Google Places tenga cobertura, que es prácticamente todo el mundo. Solo tienes que indicar el país, ciudad o código postal.',
  },
  {
    q: '¿Es legal contactar con estos negocios?',
    a: 'Los datos son públicos (nombre, teléfono, dirección). Al exportarlos y usarlos para contactar, tú pasas a ser responsable de cumplir la normativa de comunicaciones comerciales de tu país: identificarte con claridad y ofrecer darse de baja. Más detalle en nuestra política de tratamiento de datos.',
  },
  {
    q: '¿Puedo cambiar o cancelar mi plan cuando quiera?',
    a: 'Sí, desde Plan y facturación puedes subir, bajar o cancelar en cualquier momento. Sigue activo hasta el final del periodo ya pagado.',
  },
  {
    q: '¿Qué pasa si supero el límite de búsquedas de mi plan?',
    a: 'Te avisamos al llegar al límite y puedes subir de plan al momento para seguir buscando sin esperar al mes siguiente.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-border py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-2xl divide-y divide-border rounded-2xl border border-border bg-surface">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-fg">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className="grid transition-all duration-200 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
