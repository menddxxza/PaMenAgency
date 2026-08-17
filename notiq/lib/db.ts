import postgres from 'postgres';

/**
 * Conexión compartida a Neon.
 *
 * A diferencia de la versión con Supabase, aquí no hay una identidad de Postgres
 * por usuario (RLS + PostgREST): esta misma conexión, con todos los permisos,
 * sirve todas las peticiones. La autorización vive en cada consulta — hay que
 * filtrar por user_id explícitamente en cada una, siempre.
 */
let cliente: ReturnType<typeof postgres> | null = null;

export function baseDeDatosConfigurada(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** El `sql` con el que se hacen las consultas: `db()\`select ... from notes\`` */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL no está configurado. Copia .env.example a .env.local y añade el connection string de Neon.',
    );
  }

  if (!cliente) {
    cliente = postgres(url, {
      ssl: 'require',
      // Neon pausa la base tras un rato de inactividad (para no cobrar cómputo
      // sin uso) y tarda unos segundos en despertar. Sin margen, la primera
      // petición después de una pausa falla en vez de esperar a que arranque.
      connect_timeout: 20,
    });
  }

  return cliente;
}

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Antes de castear un id que viene de fuera (parámetro de ruta, formData, JSON) a
 * `::uuid` en una consulta, hay que comprobar que parece un UUID. Sin PostgREST de
 * por medio, un string cualquiera lanza un error de Postgres ("invalid input syntax
 * for type uuid") en vez de devolver "no encontrado" — y un id que no existe no
 * debería tumbar la petición con un 500.
 */
export function esUuid(valor: unknown): valor is string {
  return typeof valor === 'string' && PATRON_UUID.test(valor);
}
