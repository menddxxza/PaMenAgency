export default function AvisoSinSupabase() {
  return (
    <div className="card p-5 text-sm">
      <p className="font-semibold">Falta configurar Supabase</p>
      <p className="mt-2 text-ink/65">
        Este despliegue todavía no tiene credenciales. Copia{' '}
        <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">.env.example</code>{' '}
        a <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">.env.local</code>,
        rellena <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, y ejecuta la
        migración de <code className="font-mono text-xs">supabase/migrations</code>.
      </p>
    </div>
  );
}
