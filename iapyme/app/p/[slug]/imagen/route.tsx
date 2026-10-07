import { ImageResponse } from 'next/og';
import { getProducto } from '@/lib/queries';
import { NOMBRE_TIPO, precioResumido } from '@/lib/formato';

export const runtime = 'edge';

/**
 * Imagen vertical (formato historia: 1080×1920) para que un vendedor pueda
 * descargar su ficha como imagen y compartirla en WhatsApp Estado o
 * Instagram Stories — sitios donde un enlace suelto no se ve ni se puede
 * tocar. Es una ruta aparte de `opengraph-image.tsx`: esa es horizontal y la
 * genera Next en automático al compartir un link; esta es vertical y la pide
 * el propio vendedor a propósito desde el botón "Descargar imagen".
 */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const producto = await getProducto(params.slug);

  if (!producto) {
    return new Response('No encontrada', { status: 404 });
  }

  const precio = precioResumido(producto).principal;
  const tipo = NOMBRE_TIPO[producto.product_type];
  const titulo = producto.titulo.length > 60 ? `${producto.titulo.slice(0, 60)}…` : producto.titulo;
  const tagline =
    producto.tagline.length > 140 ? `${producto.tagline.slice(0, 140)}…` : producto.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '96px 80px',
          background: producto.cover_image_url
            ? undefined
            : 'linear-gradient(160deg, #15203f 0%, #1f2b52 45%, #3350e6 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {producto.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={producto.cover_image_url}
              alt=""
              width={1080}
              height={1920}
              style={{ position: 'absolute', inset: 0, objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(0deg, rgba(10,14,30,0.92) 0%, rgba(10,14,30,0.35) 55%, rgba(10,14,30,0.55) 100%)',
              }}
            />
          </>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            IA
          </div>
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>IAPyme</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <span style={{ fontSize: 30, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 24 }}>
            {tipo}
          </span>
          <span style={{ fontSize: 68, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            {titulo}
          </span>
          <span style={{ marginTop: 28, fontSize: 32, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
            {tagline}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '18px 32px',
              borderRadius: 999,
              background: 'white',
              color: '#15203f',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {precio}
          </div>
          <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>
            iapymeapp.com/p/{producto.slug}
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
