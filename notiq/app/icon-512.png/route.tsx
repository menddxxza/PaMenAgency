import { ImageResponse } from 'next/og';
import { elementoIconoNotiq } from '@/lib/iconoNotiq';

// Este es el que usan Android/Chrome para el banner de "Instalar app" y para el
// icono maskable — necesita ser 512×512 de verdad, no un 192 escalado.
export const dynamic = 'force-static';
// elementoIconoNotiq lee public/logo.png con fs.readFileSync — no disponible
// en el runtime Edge, de ahí forzar Node aquí en vez de dejarlo al valor por
// defecto.
export const runtime = 'nodejs';

export async function GET() {
  return new ImageResponse(elementoIconoNotiq(512), { width: 512, height: 512 });
}
