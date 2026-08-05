import { NextResponse } from 'next/server';
import { getSesion, type Sesion } from '@/lib/sesion';
import { consumirOperacionIa } from '@/lib/ia/limites';
import { ErrorIA, iaConfigurada } from '@/lib/ia/openai';
import { limitesDe } from '@/lib/planes';

/**
 * Preámbulo común de las tres rutas de IA: sesión, IA configurada y cuota del plan.
 *
 * La cuota se consume ANTES de llamar al proveedor. Si la llamada falla luego, el
 * usuario pierde una operación de su cuota — es el lado por el que conviene
 * equivocarse: al revés, un error del proveedor a mitad de respuesta dejaría una
 * llamada pagada sin contabilizar y la cuota dejaría de proteger nada.
 */
export async function prepararIa(): Promise<
  { ok: true; sesion: Sesion } | { ok: false; respuesta: NextResponse }
> {
  const sesion = await getSesion();
  if (!sesion) {
    return {
      ok: false,
      respuesta: NextResponse.json({ error: 'Sesión caducada. Vuelve a entrar.' }, { status: 401 }),
    };
  }

  if (!iaConfigurada()) {
    return {
      ok: false,
      respuesta: NextResponse.json(
        { error: 'La IA no está configurada en este despliegue.' },
        { status: 503 },
      ),
    };
  }

  const cuota = await consumirOperacionIa(sesion.userId, sesion.plan);
  if (!cuota.permitido) {
    const limites = limitesDe(sesion.plan);
    return {
      ok: false,
      respuesta: NextResponse.json(
        {
          error: `Has gastado las ${cuota.limite} operaciones de IA de este mes del plan ${limites.nombre}. Pasa a Pro para tener más.`,
        },
        { status: 429 },
      ),
    };
  }

  return { ok: true, sesion };
}

/** Traduce un fallo de la capa de IA a una respuesta HTTP sin filtrar detalles. */
export function respuestaDeError(fallo: unknown): NextResponse {
  if (fallo instanceof ErrorIA) {
    return NextResponse.json({ error: fallo.message }, { status: fallo.estado });
  }

  console.error('[notiq] error inesperado en una ruta de IA', fallo);
  return NextResponse.json({ error: 'Algo ha ido mal. Inténtalo de nuevo.' }, { status: 500 });
}

/** Recorta el contenido que se manda al modelo para acotar el coste por llamada. */
export function recortar(texto: string, maxCaracteres = 24_000): string {
  if (texto.length <= maxCaracteres) return texto;
  return `${texto.slice(0, maxCaracteres)}\n\n[…nota recortada por longitud]`;
}
