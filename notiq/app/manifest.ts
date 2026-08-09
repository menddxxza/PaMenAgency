import type { MetadataRoute } from 'next';

/**
 * Manifest de PWA: lo que hace que "Añadir a pantalla de inicio" en Android
 * ofrezca un icono y un nombre propios en vez del típico atajo con el favicon
 * pequeño y la URL debajo. En iOS lo que de verdad importa es apple-icon.tsx (Safari
 * históricamente ignora buena parte del manifest), así que los dos van a la vez.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Notiq — Notas y tareas con IA',
    short_name: 'Notiq',
    description: 'Notas por bloques, tareas y un asistente que ha leído todo lo que escribes.',
    start_url: '/inicio',
    display: 'standalone',
    background_color: '#faf9f7',
    theme_color: '#6829e0',
    lang: 'es',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
