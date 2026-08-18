export default function AvisoSinBaseDeDatos() {
  return (
    <div className="card p-5 text-sm">
      <p className="font-semibold">Falta configurar la base de datos</p>
      <p className="mt-2 text-ink/65">
        Este despliegue todavía no tiene credenciales. Copia{' '}
        <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">.env.example</code>{' '}
        a <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">.env.local</code>,
        añade <code className="font-mono text-xs">DATABASE_URL</code> con el connection string de
        tu proyecto de Neon, y ejecuta{' '}
        <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">
          migrations/0001_neon.sql
        </code>
        .
      </p>
    </div>
  );
}
