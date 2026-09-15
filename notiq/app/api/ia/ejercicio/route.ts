import { NextResponse, type NextRequest } from 'next/server';
import { completarConImagenJson } from '@/lib/ia/openai';
import { SISTEMA_EJERCICIO } from '@/lib/ia/prompts';
import { prepararIa, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
// Igual que los adjuntos (ver app/(app)/adjuntos/actions.ts): de sobra para la
// foto de un ejercicio hecha con el móvil.
const TAMANO_MAXIMO = 8 * 1024 * 1024;

type RespuestaModelo = {
  enunciado?: unknown;
  resultado?: unknown;
  pasos?: unknown;
  practica?: { enunciado?: unknown; respuesta?: unknown };
};

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const formulario = await request.formData();
    const archivo = formulario.get('imagen');

    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: 'Falta la foto del ejercicio.' }, { status: 400 });
    }
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return NextResponse.json({ error: 'Solo se admiten fotos JPG, PNG o WEBP.' }, { status: 400 });
    }
    if (archivo.size > TAMANO_MAXIMO) {
      return NextResponse.json({ error: 'La foto pesa demasiado (máximo 8 MB).' }, { status: 413 });
    }

    const base64 = Buffer.from(await archivo.arrayBuffer()).toString('base64');

    const datos = await completarConImagenJson<RespuestaModelo>({
      mensajeSistema: SISTEMA_EJERCICIO,
      mensajeUsuario: 'Resuelve el ejercicio de esta foto.',
      imagenBase64: base64,
      imagenTipo: archivo.type,
    });

    const pasos = Array.isArray(datos.pasos)
      ? datos.pasos
          .filter((p): p is string => typeof p === 'string')
          .map((p) => p.trim().slice(0, 300))
          .filter(Boolean)
          .slice(0, 8)
      : [];

    const practica =
      datos.practica && typeof datos.practica.enunciado === 'string' && typeof datos.practica.respuesta === 'string'
        ? {
            enunciado: datos.practica.enunciado.trim().slice(0, 300),
            respuesta: datos.practica.respuesta.trim().slice(0, 300),
          }
        : null;

    if (pasos.length === 0) {
      return NextResponse.json(
        { error: 'No se ha reconocido ningún ejercicio en esta foto. Prueba con otra, más clara.' },
        { status: 422 },
      );
    }

    return NextResponse.json({
      enunciado: typeof datos.enunciado === 'string' ? datos.enunciado.trim().slice(0, 500) : '',
      resultado: typeof datos.resultado === 'string' ? datos.resultado.trim().slice(0, 200) : '',
      pasos,
      practica: practica && practica.enunciado && practica.respuesta ? practica : null,
    });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
