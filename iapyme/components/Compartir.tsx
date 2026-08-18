'use client';

import { useEffect, useState } from 'react';
import Icono from './Icono';

export default function Compartir({ titulo, url }: { titulo: string; url: string }) {
  const [copiado, setCopiado] = useState(false);
  // Arranca en false en servidor y cliente por igual, y solo se activa tras
  // montar: si dependiera de `navigator` en el primer render, el HTML del
  // servidor (sin navigator) y el del cliente (con navigator) no coincidirían,
  // y React se quejaría de un mismatch de hidratación.
  const [compartirNativoDisponible, setCompartirNativoDisponible] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCompartirNativoDisponible(true);
    }
  }, []);

  const mensaje = `${titulo} — en IAPyme`;

  async function compartirNativo() {
    try {
      await navigator.share({ title: mensaje, url });
    } catch {
      // El usuario cierra el panel nativo sin elegir: no es un error.
    }
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el enlace de WhatsApp sigue funcionando.
    }
  }

  if (compartirNativoDisponible) {
    return (
      <button
        type="button"
        onClick={compartirNativo}
        className="btn-secondary w-full"
      >
        <Icono nombre="compartir" className="h-4 w-4" />
        Compartir
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${mensaje} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex-1"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copiarEnlace}
        className="btn-secondary flex-1"
      >
        <Icono nombre="enlace" className="h-4 w-4" />
        {copiado ? '¡Copiado!' : 'Copiar enlace'}
      </button>
    </div>
  );
}
