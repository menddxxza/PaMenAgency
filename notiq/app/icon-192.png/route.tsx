import { ImageResponse } from 'next/og';
import { elementoIconoNotiq } from '@/lib/iconoNotiq';

// URL fija (a diferencia de app/icon.tsx, que Next versiona con un hash) para que
// app/manifest.ts pueda apuntar a ella sin adivinar la ruta que genera Next.
// force-static: el icono no cambia con cada petición, así que se genera una vez en
// el build y se sirve como archivo estático, no en cada visita.
export const dynamic = 'force-static';

export async function GET() {
  return new ImageResponse(elementoIconoNotiq(192), { width: 192, height: 192 });
}
