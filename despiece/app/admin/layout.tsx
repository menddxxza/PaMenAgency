import Link from 'next/link';
import { login, logout } from '@/app/admin/actions';
import { adminAccess } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = adminAccess();

  if (access === 'disabled') {
    return (
      <div className="panel max-w-xl border-l-2 border-l-accent p-5">
        <h1 className="label">Admin cerrado</h1>
        <p className="mt-2 text-sm text-text-2">
          El panel escribe con la clave <span className="font-mono">service_role</span>, que salta RLS. En
          producción hace falta definir <span className="font-mono">ADMIN_TOKEN</span> para poder abrirlo.
        </p>
      </div>
    );
  }

  if (access === 'needs-token') {
    return (
      <form action={login} className="panel max-w-sm space-y-3 p-5">
        <h1 className="label">Acceso al panel</h1>
        <input
          type="password"
          name="token"
          autoComplete="current-password"
          placeholder="ADMIN_TOKEN"
          className="input font-mono"
          required
        />
        <button type="submit" className="btn btn-accent w-full justify-center">
          Entrar
        </button>
        <p className="font-mono text-[10px] leading-relaxed text-text-3">
          Provisional hasta que exista Supabase Auth con rol admin (fase 2 del plan).
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <span className="border border-accent px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
            Panel administrativo
          </span>
          <h1 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Administración</h1>
        </div>
        <nav className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
          <Link href="/admin" className="hover:text-text">
            Resumen
          </Link>
          <Link href="/admin/modelo/nuevo" className="hover:text-text">
            Subir GLB
          </Link>
          <form action={logout}>
            <button type="submit" className="hover:text-text">
              Salir
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
