'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_OK = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export default function SubirImagen({
  userId,
  valor,
  onChange,
  aspecto = 'aspect-video',
}: {
  userId: string;
  valor: string;
  onChange: (url: string) => void;
  /** Clase de Tailwind para la relación de aspecto de la vista previa. */
  aspecto?: string;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    setError(null);

    if (!TIPOS_OK.includes(archivo.type)) {
      setError('Sube una imagen PNG, JPG, WEBP o GIF.');
      return;
    }
    if (archivo.size > MAX_BYTES) {
      setError('La imagen no puede pasar de 5 MB.');
      return;
    }

    setSubiendo(true);

    // La carpeta tiene que ser el id del usuario: la política de Storage solo deja
    // escribir dentro de la propia.
    const extension = archivo.name.split('.').pop() ?? 'png';
    const ruta = `${userId}/${Date.now()}.${extension}`;

    const supabase = createClient();
    const { error: errorSubida } = await supabase.storage
      .from('productos')
      .upload(ruta, archivo, { upsert: false });

    if (errorSubida) {
      setError('No hemos podido subir la imagen. Inténtalo de nuevo.');
      setSubiendo(false);
      return;
    }

    const { data } = supabase.storage.from('productos').getPublicUrl(ruta);
    onChange(data.publicUrl);
    setSubiendo(false);
  }

  return (
    <div className="mt-1.5">
      {valor ? (
        <div className="relative overflow-hidden rounded-xl border border-ink/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={valor} alt="Imagen elegida" className={`${aspecto} w-full object-cover`} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold shadow"
          >
            Quitar
          </button>
        </div>
      ) : (
        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed
                     border-ink/25 bg-ink/[0.02] px-4 py-8 text-center transition hover:border-brand-400"
        >
          <span className="text-2xl" aria-hidden>
            🖼️
          </span>
          <span className="mt-2 text-sm font-semibold">
            {subiendo ? 'Subiendo…' : 'Elegir imagen'}
          </span>
          <span className="mt-0.5 text-xs text-ink/50">PNG, JPG, WEBP o GIF · máx. 5 MB</span>
          <input
            type="file"
            accept={TIPOS_OK.join(',')}
            onChange={onFile}
            disabled={subiendo}
            className="sr-only"
          />
        </label>
      )}

      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
