import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notiq.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Notiq — Notas y tareas con IA que conoce tu contexto',
  description:
    'Notas por bloques, tareas con vista Kanban y un asistente que ha leído todo lo que escribes. Resume tus notas, saca las tareas de una reunión y responde qué tienes pendiente.',
  keywords: ['notas', 'tareas', 'productividad', 'IA', 'kanban', 'markdown'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: 'Notiq',
    title: 'Notiq — Notas y tareas con IA que conoce tu contexto',
    description:
      'Escribe, organiza y pregunta. Notiq resume tus notas, extrae las tareas y te dice qué tienes pendiente.',
  },
  alternates: { canonical: '/' },
  // Safari ignora buena parte del manifest de PWA para el modo "standalone" (sin
  // barra de navegador) al añadir a la pantalla de inicio en iOS; estas etiquetas
  // clásicas son las que de verdad lee. Android sí se fía del manifest (ver
  // app/manifest.ts), pero no está de más que las dos coincidan.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Notiq',
  },
};

export const viewport: Viewport = {
  themeColor: '#6829e0',
};

/*
 * Aplica la clase `.dark` (ver --color-* en globals.css) antes del primer pintado.
 * Sin esto, React hidrataría en claro y luego la cambiaría a oscuro tras montar
 * InterruptorTema.tsx — un parpadeo visible en cada carga para quien ya eligió
 * oscuro. Un <script> normal (no un efecto de React) es la única forma de que esto
 * corra antes de que el navegador pinte el primer frame.
 */
const SCRIPT_TEMA = `
(function () {
  try {
    var guardado = localStorage.getItem('notiq-tema');
    var oscuro = guardado ? guardado === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (oscuro) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
