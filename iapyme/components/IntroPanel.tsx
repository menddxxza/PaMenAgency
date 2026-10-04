'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icono, { type NombreIcono } from './Icono';

const CLAVE = 'iapyme_intro_vista';

/**
 * Las 4 piezas del marketplace, explicadas en una frase cada una. A
 * diferencia de "Cómo usar tu panel" (que es un checklist de progreso y
 * vuelve a aparecer mientras falten pasos), esto es solo orientación: se ve
 * una vez, se cierra, y no vuelve a salir aunque no se haya hecho nada.
 */
const PIEZAS: { icono: NombreIcono; titulo: string; texto: string; href: string }[] = [
  {
    icono: 'explorar',
    titulo: 'Explora',
    texto: 'Busca entre soluciones, servicios, negocios, profesionales, trabajos y proyectos.',
    href: '/buscar',
  },
  {
    icono: 'publicar',
    titulo: 'Publica',
    texto: 'Ofrece lo tuyo o publica lo que buscas. Gratis, sin comisión.',
    href: '/dashboard/productos/nuevo',
  },
  {
    icono: 'mensajes',
    titulo: 'Habla directo',
    texto: 'Responde y negocia dentro del propio panel, sin intermediarios.',
    href: '/dashboard/leads',
  },
  {
    icono: 'campana',
    titulo: 'Recibe avisos',
    texto: 'Guarda una búsqueda y te avisamos por email en cuanto encaje algo.',
    href: '/dashboard/alertas',
  },
];

export default function IntroPanel() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(CLAVE)) setVisible(true);
    } catch {
      // Sin acceso a localStorage (modo privado), simplemente no se
      // enseña: mejor eso que mostrarla en cada carga de página.
    }
  }, []);

  function cerrar() {
    setVisible(false);
    try {
      window.localStorage.setItem(CLAVE, '1');
    } catch {
      // Igual que arriba: si no se puede recordar, no pasa nada grave.
    }
  }

  if (!visible) return null;

  return (
    <section className="card relative mb-6 p-6">
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar introducción"
        className="absolute right-4 top-4 rounded-lg p-1.5 text-ink/40 transition hover:bg-ink/[0.05] hover:text-ink"
      >
        ✕
      </button>

      <h2 className="pr-8 font-bold">Así funciona IAPyme</h2>
      <p className="mt-1 text-sm text-ink/60">Cuatro cosas, y ya sabes moverte por aquí.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PIEZAS.map((pieza) => (
          <Link
            key={pieza.titulo}
            href={pieza.href}
            className="rounded-xl border border-ink/10 p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
          >
            <Icono nombre={pieza.icono} className="h-5 w-5 text-brand-600" />
            <p className="mt-2 text-sm font-semibold">{pieza.titulo}</p>
            <p className="mt-0.5 text-xs text-ink/55">{pieza.texto}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
