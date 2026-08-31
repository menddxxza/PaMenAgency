'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SplineScene = dynamic(() => import('@/components/ui/splite').then((m) => m.SplineScene), {
  ssr: false,
});

const ESCENA_3D = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * Sustituye al antiguo EscenaHeroLazy (nudo toroidal en three.js) por la
 * escena de Spline. Mismo patrón: carga solo en cliente y solo si el usuario
 * no ha pedido movimiento reducido — `next/dynamic` con `ssr:false` no se
 * puede llamar desde un Server Component, así que este envoltorio (cliente)
 * es el punto donde de verdad se decide si la escena llega a montarse.
 */
export default function SplineHeroLazy() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPermitido(!prefiereReducido);
  }, []);

  if (!permitido) return null;

  return <SplineScene scene={ESCENA_3D} className="h-full w-full" />;
}
