import { ImageResponse } from 'next/og';
import { elementoIconoNotiq } from '@/lib/iconoNotiq';

// elementoIconoNotiq lee public/logo.png con fs.readFileSync — no disponible
// en el runtime Edge, de ahí forzar Node aquí en vez de dejarlo al valor por
// defecto.
export const runtime = 'nodejs';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icono() {
  return new ImageResponse(elementoIconoNotiq(32), size);
}
