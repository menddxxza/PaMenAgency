import { NextResponse, type NextRequest } from 'next/server';
import { getSesion } from '@/lib/sesion';
import { obtenerTranscripcionYoutube, ErrorYoutube } from '@/lib/youtube';

export const runtime = 'nodejs';
// Suficiente para leer la página del vídeo y el XML de subtítulos — nada de IA
// aquí, así que no hace falta el margen de 60s de las rutas de /api/ia.
export const maxDuration = 30;

/**
 * Solo saca la transcripción — no consume cuota de IA porque no llama a
 * ningún modelo, es leer la propia página pública de YouTube (ver
 * lib/youtube.ts). Los pasos de después (apuntes, flashcards, examen) sí
 * pasan cada uno por /api/ia/* y sí cuentan, igual que "Grabar clase".
 */
export async function POST(request: NextRequest) {
  const sesion = await getSesion();
  if (!sesion) {
    return NextResponse.json({ error: 'Sesión caducada. Vuelve a entrar.' }, { status: 401 });
  }

  try {
    const cuerpo = (await request.json()) as { url?: string };
    const url = (cuerpo.url ?? '').trim();
    if (!url) {
      return NextResponse.json({ error: 'Pega el enlace de un vídeo de YouTube.' }, { status: 400 });
    }

    const { titulo, texto } = await obtenerTranscripcionYoutube(url);
    return NextResponse.json({ titulo, texto });
  } catch (fallo) {
    if (fallo instanceof ErrorYoutube) {
      return NextResponse.json({ error: fallo.message }, { status: 422 });
    }
    console.error('[notiq] error inesperado sacando la transcripción de YouTube', fallo);
    return NextResponse.json({ error: 'Algo ha ido mal. Inténtalo de nuevo.' }, { status: 500 });
  }
}
