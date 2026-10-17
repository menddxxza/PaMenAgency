import type { Metadata } from 'next';
import './globals.css';
import { spaceGrotesk, inter, jetbrainsMono } from '@/lib/fonts';
import { PwaRegister } from '@/components/pwa-register';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://revynai.es';

export const metadata: Metadata = {
  title: {
    default: 'Revynai — Tu próxima fuente de ingresos, dentro de tu propio negocio',
    template: '%s — Revynai',
  },
  description:
    'Revynai analiza tu empresa, detecta oportunidades de ingreso reales y pone agentes de IA a trabajar para convertirlas en clientes. Un producto de PaMenAgency.',
  metadataBase: new URL(SITE_URL),
  applicationName: 'Revynai',
  keywords: ['crecimiento empresarial', 'IA para negocios', 'generación de leads', 'agentes de IA', 'PaMenAgency'],
  authors: [{ name: 'PaMenAgency', url: 'https://pamenagency.com' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Revynai',
  },
  openGraph: {
    type: 'website',
    siteName: 'Revynai',
    title: 'Revynai — Tu próxima fuente de ingresos, dentro de tu propio negocio',
    description:
      'Conecta tu empresa. Dile cuánto quieres crecer. La IA encuentra dónde está el dinero y pone agentes a trabajar para conseguirlo.',
    url: SITE_URL,
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revynai — Estrategia de crecimiento ejecutada por agentes de IA',
    description: 'Analiza tu negocio, detecta oportunidades y activa agentes que las convierten en ingresos.',
  },
};

export const viewport = {
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
