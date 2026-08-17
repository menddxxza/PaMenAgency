'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ENLACES = [
  { href: '/dashboard', etiqueta: 'Resumen', icono: '📊', exacto: true },
  { href: '/dashboard/productos', etiqueta: 'Mis productos', icono: '📦' },
  { href: '/dashboard/leads', etiqueta: 'Mensajes', icono: '💬' },
  { href: '/dashboard/favoritos', etiqueta: 'Mis favoritos', icono: '🤍' },
  { href: '/dashboard/perfil', etiqueta: 'Mi perfil', icono: '👤' },
  { href: '/dashboard/cuenta', etiqueta: 'Mi cuenta', icono: '⚙️' },
];

export default function NavPanel({ esAdmin }: { esAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="mt-7 space-y-0.5">
      {ENLACES.map((enlace) => {
        const activo = enlace.exacto
          ? pathname === enlace.href
          : pathname.startsWith(enlace.href);

        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            aria-current={activo ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              activo
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'text-ink/70 hover:bg-ink/[0.04]'
            }`}
          >
            <span aria-hidden>{enlace.icono}</span>
            {enlace.etiqueta}
          </Link>
        );
      })}

      {esAdmin ? (
        <>
          <p className="px-3 pb-1 pt-5 text-xs font-bold uppercase tracking-wider text-ink/35">
            Administración
          </p>
          <Link
            href="/admin"
            aria-current={pathname === '/admin' ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              pathname === '/admin'
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'text-ink/70 hover:bg-ink/[0.04]'
            }`}
          >
            <span aria-hidden>🛡️</span>
            Moderación
          </Link>
          <Link
            href="/admin/vendedores"
            aria-current={pathname === '/admin/vendedores' ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              pathname === '/admin/vendedores'
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'text-ink/70 hover:bg-ink/[0.04]'
            }`}
          >
            <span aria-hidden>✓</span>
            Vendedores
          </Link>
        </>
      ) : null}
    </nav>
  );
}
