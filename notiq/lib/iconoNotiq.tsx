import { LOGO_PNG_BASE64 } from '@/lib/logoBase64';

/**
 * El icono de la app (favicon, apple-touch-icon y el manifest de PWA) sale de
 * public/logo.png, incrustado como `data:` URI a partir de una constante ya
 * generada (lib/logoBase64.ts) — no leído con fs.readFileSync en tiempo de
 * ejecución. Esa primera versión funcionaba en el build local pero rompía en
 * Vercel: la función serverless no tiene el contenido de public/ en su propio
 * sistema de archivos (se sirve aparte por CDN), así que `readFileSync` daba
 * ENOENT ahí aunque en local sí encontrara el archivo. Con el string ya
 * incrustado en el bundle no hace falta leer nada en ningún runtime.
 *
 * Sin `borderRadius` aquí: Apple aplica su propia máscara (esquinas
 * redondeadas o "squircle") al apple-touch-icon, y Android hace lo mismo con
 * los iconos `purpose: "maskable"` del manifest — un icono ya recortado por
 * dentro queda recortado dos veces, o mal encajado si el sistema espera el
 * cuadrado entero. public/logo.png ya es un cuadrado completo (la imagen trae
 * sus esquinas redondeadas "pintadas", no recortadas de verdad).
 */
const LOGO_DATA_URI = `data:image/png;base64,${LOGO_PNG_BASE64}`;

export function elementoIconoNotiq(size: number) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- dentro de una
          ImageResponse (Satori) no existe next/image: tiene que ser un <img>. */}
      <img src={LOGO_DATA_URI} width={size} height={size} alt="" />
    </div>
  );
}
