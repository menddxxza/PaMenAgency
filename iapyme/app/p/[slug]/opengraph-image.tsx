import { ImageResponse } from 'next/og';
import { getProducto } from '@/lib/queries';
import { NOMBRE_TIPO, precioResumido } from '@/lib/formato';

export const runtime = 'edge';
export const alt = 'IAPyme';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Tarjeta de respaldo para compartir una ficha sin portada propia. Cuando
 * `cover_image_url` existe, `generateMetadata` en page.tsx la usa a ella en
 * su lugar — esta solo entra cuando no hay nada mejor que enseñar, para que
 * ninguna ficha se comparta con la tarjeta genérica en blanco de Next.
 */
export default async function Imagen({ params }: { params: { slug: string } }) {
  const producto = await getProducto(params.slug);

  const titulo = producto?.titulo ?? 'IAPyme';
  const tagline = producto?.tagline ?? 'El marketplace de soluciones de IA para pymes';
  const precio = producto ? precioResumido(producto).principal : null;
  const tipo = producto ? NOMBRE_TIPO[producto.product_type] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #15203f 0%, #1f2b52 45%, #3350e6 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            IA
          </div>
          <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>IAPyme</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          {tipo ? (
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 18,
              }}
            >
              {tipo}
            </span>
          ) : null}
          <span
            style={{
              fontSize: 60,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
            }}
          >
            {titulo.length > 70 ? `${titulo.slice(0, 70)}…` : titulo}
          </span>
          <span
            style={{
              marginTop: 22,
              fontSize: 28,
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.35,
            }}
          >
            {tagline.length > 110 ? `${tagline.slice(0, 110)}…` : tagline}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {precio ? (
            <div
              style={{
                display: 'flex',
                padding: '12px 24px',
                borderRadius: 999,
                background: 'white',
                color: '#15203f',
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {precio}
            </div>
          ) : null}
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
            Sin comisión · Trato directo con quien lo ha construido
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
