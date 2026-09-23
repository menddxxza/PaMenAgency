'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icono, { type NombreIcono } from './Icono';

const ENTRADAS: { href: string; texto: string; icono: NombreIcono }[] = [
  { href: '/', texto: 'Inicio', icono: 'inicio' },
  { href: '/explorar', texto: 'Explorar', icono: 'explorar' },
  { href: '/publicar', texto: 'Publicar', icono: 'publicar' },
  { href: '/dashboard/leads', texto: 'Mensajes', icono: 'mensajes' },
  { href: '/dashboard', texto: 'Perfil', icono: 'perfil' },
];

/**
 * Barra inferior de móvil. Es la navegación principal en pantalla pequeña:
 * cinco destinos fijos, al alcance del pulgar, sin menús desplegables.
 *
 * Se oculta desde `md` porque ahí ya está la cabecera con las familias. El
 * hueco que ocupa lo reserva `body` en globals.css: si no, tapa lo último de
 * cada página.
 */
export default function NavInferior() {
  const ruta = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-superficie-200
                 bg-superficie-0/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {ENTRADAS.map((entrada) => {
          const activa =
            entrada.href === '/' ? ruta === '/' : ruta.startsWith(entrada.href);

          return (
            <li key={entrada.href}>
              <Link
                href={entrada.href}
                aria-current={activa ? 'page' : undefined}
                className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1
                            text-[11px] transition-colors duration-fast ease-out
                            focus:outline-none focus-visible:bg-superficie-100 ${
                              activa ? 'text-brand-600' : 'text-ink/55 hover:text-ink'
                            }`}
              >
                <Icono nombre={entrada.icono} className="h-[22px] w-[22px]" />
                {entrada.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
