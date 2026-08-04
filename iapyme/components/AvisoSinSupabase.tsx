export default function AvisoSinSupabase({
  que = 'Esta parte',
}: {
  que?: string;
}) {
  return (
    <div className="card border-amber-300 bg-amber-50 p-5">
      <p className="text-sm font-bold text-amber-900">Falta configurar Supabase</p>
      <p className="mt-1 text-sm text-amber-900/80">
        {que} necesita conexión con la base de datos. Crea el proyecto en Supabase, ejecuta{' '}
        <code className="rounded bg-amber-900/10 px-1">
          supabase/migrations/0001_fase1.sql
        </code>{' '}
        y añade <code className="rounded bg-amber-900/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
        y <code className="rounded bg-amber-900/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
        al entorno.
      </p>
    </div>
  );
}
