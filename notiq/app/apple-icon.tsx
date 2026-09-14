import { ImageResponse } from 'next/og';
import { elementoIconoNotiq } from '@/lib/iconoNotiq';

// elementoIconoNotiq lee public/logo.png con fs.readFileSync — no disponible
// en el runtime Edge, de ahí forzar Node aquí en vez de dejarlo al valor por
// defecto.
export const runtime = 'nodejs';

// 180×180 es el tamaño que recomienda Apple para el icono de pantalla de inicio
// en los iPhone actuales; iOS lo escala él solo para el resto (ajustes, Spotlight).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcono() {
  return new ImageResponse(elementoIconoNotiq(180), size);
}
