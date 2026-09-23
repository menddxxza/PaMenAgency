import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import FavoritosProvider from '@/components/FavoritosProvider';
import NavInferior from '@/components/NavInferior';
import './globals.css';

// Tres roles, tres familias, cada una por un motivo:
//
// Inter para interfaz y texto corrido. Es la que mejor aguanta tamaños
// pequeños y densidad, que es lo que tiene un marketplace: listados, filtros,
// fichas.
//
// Instrument Sans para titulares. Antes display y cuerpo eran la misma fuente,
// y el resultado era correcto pero anónimo: se parecía a cualquier producto
// hecho con Inter. Esta grotesca es algo más estrecha y tiene formas propias
// (la 'a', la 'g'), así que da voz a la marca sin recurrir a una fuente
// decorativa.
//
// JetBrains Mono solo para cifras: precios, contadores, datos que se comparan
// en columna y necesitan ancho fijo.
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'IAPyme — El marketplace de soluciones de IA para pymes',
  description:
    'El primer marketplace vertical de soluciones de IA en español. Compra automatizaciones, agentes y bots listos para usar, o vende los tuyos a pymes de todo el mundo hispanohablante.',
  keywords: [
    'IA para pymes',
    'marketplace de IA',
    'automatizaciones',
    'agentes de IA',
    'chatbots en español',
    'n8n',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: 'IAPyme',
    title: 'IAPyme — El marketplace de soluciones de IA para pymes',
    description:
      'Compra soluciones de IA listas para usar en 5 minutos. O vende las tuyas 1.000 veces sin dar soporte uno a uno.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IAPyme — El marketplace de soluciones de IA para pymes',
    description:
      'El primer marketplace vertical de soluciones de IA en español.',
  },
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  // Declarar `icons` a mano en el layout raíz desactiva la detección
  // automática de app/icon.png en esta versión de Next, así que hay que
  // apuntarlo aquí explícitamente igual que el de iOS.
  icons: {
    icon: '/icon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IAPyme',
  },
};

export const viewport: Viewport = {
  themeColor: '#1f47f5',
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <FavoritosProvider>
          {children}
          <NavInferior />
        </FavoritosProvider>
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </body>
    </html>
  );
}
