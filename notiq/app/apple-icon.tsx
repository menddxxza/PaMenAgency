import { ImageResponse } from 'next/og';
import { elementoIconoNotiq } from '@/lib/iconoNotiq';

// 180×180 es el tamaño que recomienda Apple para el icono de pantalla de inicio
// en los iPhone actuales; iOS lo escala él solo para el resto (ajustes, Spotlight).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcono() {
  return new ImageResponse(elementoIconoNotiq(180), size);
}
