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
};

export const viewport: Viewport = {
  themeColor: '#6829e0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
