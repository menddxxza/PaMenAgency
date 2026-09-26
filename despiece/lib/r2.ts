import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2. Elegido por egress 0 €: un GLB de motor son decenas de MB
 * y el visor los descarga en cada visita.
 *
 * Dos formas de servir un GLB:
 *   1. bucket público (NEXT_PUBLIC_R2_PUBLIC_BASE) → URL directa, cacheable.
 *   2. sin dominio público → URL firmada temporal desde el servidor.
 */

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

function client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const bucket = () => process.env.R2_BUCKET!;

/** URL de lectura para el visor, o null si R2 no está configurado. */
export async function assetUrl(storageKey: string, expiresIn = 3600): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE;
  if (base) return `${base.replace(/\/$/, '')}/${storageKey.replace(/^\//, '')}`;
  if (!r2Configured()) return null;
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: storageKey }), { expiresIn });
}

/** URL firmada de subida: el navegador sube el GLB directo a R2. */
export async function uploadUrl(storageKey: string, expiresIn = 900): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: bucket(), Key: storageKey, ContentType: 'model/gltf-binary' }),
    { expiresIn },
  );
}

/** Descarga el objeto completo (el admin lo necesita para leer los nodos). */
export async function fetchObject(storageKey: string): Promise<ArrayBuffer> {
  const res = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: storageKey }));
  const bytes = await res.Body!.transformToByteArray();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
