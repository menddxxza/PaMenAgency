import { NextResponse, type NextRequest } from 'next/server';
import { completarConImagen } from '@/lib/ia/openai';
import { SISTEMA_ESCANER } from '@/lib/ia/prompts';
import { prepararIa, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 8 * 1024 * 1024;

/** Escáner de documentos, versión simple: la foto se transcribe tal cual con
 * el mismo modelo de visión que "Resolver ejercicio" — sin recortar ni
 * enderezar antes, eso queda para una versión futura si hace falta. */
export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const formulario = await request.formData();
    const archivo = formulario.get('imagen');

    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: 'Falta la foto del documento.' }, { status: 400 });
    }
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return NextResponse.json({ error: 'Solo se admiten fotos JPG, PNG o WEBP.' }, { status: 400 });
    }
    if (archivo.size > TAMANO_MAXIMO) {
      return NextResponse.json({ error: 'La foto pesa demasiado (máximo 8 MB).' }, { status: 413 });
    }

    const base64 = Buffer.from(await archivo.arrayBuffer()).toString('base64');

    const texto = await completarConImagen({
      mensajeSistema: SISTEMA_ESCANER,
      mensajeUsuario: 'Transcribe el texto de esta foto.',
      imagenBase64: base64,
      imagenTipo: archivo.type,
      maxTokens: 2500,
    });

    if (/no se ha reconocido texto legible/i.test(texto)) {
      return NextResponse.json(
        { error: 'No se ha reconocido texto legible en esta foto. Prueba con más luz o más de cerca.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ texto });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
