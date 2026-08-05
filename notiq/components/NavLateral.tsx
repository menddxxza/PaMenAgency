'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

const ENLACES = [
  { href: '/notas', etiqueta: 'Notas', emoji: '📝' },
  { href: '/tareas', etiqueta: 'Tareas', emoji: '✅' },
  { href: '/asistente', etiqueta: 'Asistente', emoji: '🤖' },
  { href: '/ajustes', etiqueta: 'Ajustes', emoji: '⚙️' },
];

export default function NavLateral({
  email,
  plan,
  consumoIa,
}: {
  email: string | null;
  plan: string;
  consumoIa: { usadas: number; limite: number };
}) {
  const ruta = usePathname();
  const porcentaje = Math.min(100, Math.round((consumoIa.usadas / consumoIa.limite) * 100));

  return (
    <aside className="flex shrink-0 flex-col gap-6 border-ink/10 bg-paper p-4 md:h-screen md:w-60 md:border-r">
      <Link href="/notas" className="hidden md:block">
        <Logo />
      </Link>

      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {ENLACES.map((enlace) => {
          const activo = ruta === enlace.href || ruta.startsWith(`${enlace.href}/`);
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={activo ? 'page' : undefined}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
                activo ? 'bg-brand-600 text-white' : 'text-ink/70 hover:bg-ink/[0.05] hover:text-ink'
              }`}
            >
              <span aria-hidden>{enlace.emoji}</span>
              {enlace.etiqueta}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden space-y-3 md:block">
        <div className="rounded-xl border border-ink/10 bg-white p-3">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-ink/70">IA este mes</span>
            <span className="text-ink/50">
              {consumoIa.usadas}/{consumoIa.limite}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className={`h-full rounded-full ${porcentaje >= 90 ? 'bg-red-500' : 'bg-brand-500'}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          {plan === 'free' && (
            <Link href="/ajustes" className="mt-2 block text-xs font-semibold text-brand-600">
              Ampliar con Pro →
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-1">
          <p className="truncate text-xs text-ink/55" title={email ?? undefined}>
            {email}
          </p>
          <form action="/auth/salir" method="post">
            <button type="submit" className="text-xs font-semibold text-ink/55 hover:text-ink">
              Salir
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
