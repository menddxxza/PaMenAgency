'use client';

import { useEffect, useState } from 'react';
import ConstellationGrid from '@/components/ui/constellation-grid';

/**
 * Fondo del hero: red de nodos que reacciona al cursor. Se omite entero con
 * prefers-reduced-motion — mismo requisito que ya cumplían las dos figuras
 * que ocuparon este hueco antes (three.js, luego Spline), no es una decisión
 * nueva. A diferencia de esas dos, esto es solo Canvas 2D (sin dependencias
 * de navegador en la carga del módulo), así que no hace falta next/dynamic
 * con ssr:false: renderizarlo directo desde el Server Component es seguro.
 */
export default function ConstellationHeroLazy({ className }: { className?: string }) {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPermitido(!prefiereReducido);
  }, []);

  if (!permitido) return null;

  return <ConstellationGrid className={className} showOverlay={false} forceDark />;
}
