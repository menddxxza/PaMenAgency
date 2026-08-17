'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import { signIn } from '@/lib/auth';

export type ResultadoAuth = { ok: true } | { ok: false; error: string };

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
  await sql`insert into users (email, password_hash) values (${correo}, ${hash})`;

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
