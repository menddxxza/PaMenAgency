'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import { signIn } from '@/lib/auth';
import { aTextoPlano, nuevoBloque, type Bloque } from '@/lib/bloques';

export type ResultadoAuth = { ok: true } | { ok: false; error: string };

/**
 * La nota que ve quien acaba de registrarse, en vez de una pantalla vacía.
 * Usa varios tipos de bloque a propósito (título, lista, tarea, cita…): es a
 * la vez el mensaje de bienvenida y una demo rápida del propio editor.
 */
function notaDeBienvenida(): { titulo: string; bloques: Bloque[] } {
  return {
    titulo: 'Bienvenido a Notiq',
    bloques: [
      nuevoBloque('texto', 'Esto es una nota de ejemplo — bórrala en cuanto quieras, el botón "Eliminar" está arriba a la derecha.'),
      nuevoBloque('subtitulo', 'Lo básico del editor'),
      nuevoBloque('lista', 'Escribe "# " al principio de una línea para convertirla en título, "- " para lista, "[] " para tarea…'),
      nuevoBloque('lista', 'Escribe "/" en cualquier bloque de texto para abrir el menú de comandos'),
      nuevoBloque('lista', 'Arrastra una imagen o un PDF directamente sobre la nota'),
      nuevoBloque('subtitulo', 'El asistente'),
      nuevoBloque(
        'texto',
        'A la derecha tienes el asistente: puede resumir esta nota, sacarte las tareas que haya dentro, o responder lo que le preguntes — tiene contexto de todo lo que escribes.',
      ),
      nuevoBloque('subtitulo', 'Prueba esto ahora mismo'),
      { ...nuevoBloque('tarea', 'Marca esta tarea como hecha (clic en la casilla)'), hecho: false },
      { ...nuevoBloque('tarea', 'Pulsa "✨ Resumir esta nota" a la derecha'), hecho: false },
      { ...nuevoBloque('tarea', 'Ve a la pestaña Tareas y crea una tarea nueva'), hecho: false },
      nuevoBloque('cita', 'Notiq — apuntas tú, se organiza solo.'),
    ],
  };
}

/** Da de alta la cuenta y, si sale bien, inicia sesión en el mismo paso. */
export async function registrarYEntrar(
  email: string,
  password: string,
  volver: string,
): Promise<ResultadoAuth> {
  const correo = email.trim().toLowerCase();

  if (!correo || password.length < 8) {
    return {
      ok: false,
      error: 'Escribe un correo válido y una contraseña de al menos 8 caracteres.',
    };
  }

  const sql = db();
  const existente = await sql`select id from users where email = ${correo}`;
  if (existente.length > 0) {
    return { ok: false, error: 'Ya existe una cuenta con este correo.' };
  }

  // coste 12: el estándar razonable en 2026 para bcrypt en un servidor
  // compartido; más alto empieza a notarse en la latencia del registro.
  const hash = await bcrypt.hash(password, 12);
  const [usuario] = await sql<{ id: string }[]>`
    insert into users (email, password_hash) values (${correo}, ${hash}) returning id
  `;

  // Que falle esto no debe tumbar el registro: la cuenta ya existe y puede
  // entrar sin problema, solo que sin la nota de ejemplo — mejor eso que un
  // registro que a medias falla por algo que no es imprescindible.
  try {
    const { titulo, bloques } = notaDeBienvenida();
    await sql`
      insert into notes (user_id, titulo, content, texto, favorita)
      values (${usuario.id}::uuid, ${titulo}, ${sql.json(bloques)}, ${aTextoPlano(bloques)}, true)
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido crear la nota de bienvenida', fallo);
  }

  return entrar(correo, password, volver);
}

export async function entrar(email: string, password: string, volver: string): Promise<ResultadoAuth> {
  try {
    await signIn('credentials', { email: email.trim().toLowerCase(), password, redirectTo: volver });
    return { ok: true };
  } catch (fallo) {
    if (fallo instanceof AuthError) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    // signIn() implementa el redirect de éxito lanzando un error especial
    // (NEXT_REDIRECT) que Next.js reconoce para navegar. Si no se relanza aquí,
    // entrar correctamente deja de llevar a ningún sitio.
    throw fallo;
  }
}
