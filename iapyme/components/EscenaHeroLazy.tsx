'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const EscenaHero = dynamic(() => import('./EscenaHero'), { ssr: false });

/**
 * Carga la escena 3D solo en cliente y solo si el usuario no ha pedido
 * movimiento reducido. `next/dynamic` con `ssr:false` no se puede llamar
 * desde un Server Component, así que este envoltorio (cliente) es el punto
 * donde de verdad se decide si el Canvas llega a montarse.
 */
export default function EscenaHeroLazy() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPermitido(!prefiereReducido);
  }, []);

  if (!permitido) return null;

  return <EscenaHero />;
}
