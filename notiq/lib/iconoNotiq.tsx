import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * El icono de la app (favicon, apple-touch-icon y el manifest de PWA) sale de
 * public/logo.png, incrustado como `data:` URI: dentro de una ImageResponse
 * (Satori) no se puede referenciar un archivo por ruta relativa como
 * "/logo.png" de forma fiable — hay que darle los bytes ya en el propio JSX.
 * Se lee una sola vez al cargar el módulo (no en cada petición) con
 * `readFileSync`, de ahí el `runtime = 'nodejs'` explícito en los cuatro
 * ficheros que usan esto (app/icon.tsx, app/apple-icon.tsx y las dos rutas
 * icon-*.png): sin Node de verdad no hay `fs`.
 *
 * Sin `borderRadius` aquí: Apple aplica su propia máscara (esquinas
 * redondeadas o "squircle") al apple-touch-icon, y Android hace lo mismo con
 * los iconos `purpose: "maskable"` del manifest — un icono ya recortado por
 * dentro queda recortado dos veces, o mal encajado si el sistema espera el
 * cuadrado entero. public/logo.png ya es un cuadrado completo (la propia
 * imagen trae su esquinas redondeadas "pintadas", no recortadas de verdad).
 */
const LOGO_DATA_URI = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public', 'logo.png'),
).toString('base64')}`;

export function elementoIconoNotiq(size: number) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- dentro de una
          ImageResponse (Satori) no existe next/image: tiene que ser un <img>. */}
      <img src={LOGO_DATA_URI} width={size} height={size} alt="" />
    </div>
  );
}
