import { NextResponse, type NextRequest } from 'next/server';
import { transcribirAudio } from '@/lib/ia/openai';
import { prepararIa, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';
export const maxDuration = 60;

// 25 MB: el límite que ya impone el proveedor de transcripción (Groq/Whisper) por
// archivo. Rechazarlo aquí da un error claro en vez del que devolvería el
// proveedor al rechazar la subida.
const TAMANO_MAXIMO = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const formulario = await request.formData();
    const archivo = formulario.get('audio');

    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo de audio.' }, { status: 400 });
    }
    if (archivo.size > TAMANO_MAXIMO) {
      return NextResponse.json(
        { error: 'La grabación pesa demasiado (máximo 25 MB, prueba a grabar en tramos más cortos).' },
        { status: 413 },
      );
    }

    const texto = await transcribirAudio(archivo, archivo.name || 'clase.webm');
    return NextResponse.json({ texto });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
