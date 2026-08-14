import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display + cuerpo + dato. Tres roles, ni uno más.
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
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
  icons: {
    icon: '/icon.svg',
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
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {children}
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
