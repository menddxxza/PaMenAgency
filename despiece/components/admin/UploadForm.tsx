'use client';

import { useState } from 'react';
import { registerModel } from '@/app/admin/actions';

/**
 * Sube el GLB directo a R2 con una URL firmada (no pasa por el servidor:
 * los GLB pesan decenas de MB) y después registra el modelo, que es cuando
 * el servidor lee sus nodos.
 */
export function UploadForm({ vehicles }: { vehicles: { id: string; slug: string }[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<'idle' | 'uploading' | 'uploaded'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState('');

  const upload = async () => {
    if (!file) return;
    setError(null);
    setState('uploading');
    try {
      const res = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });
      const data = (await res.json()) as { url?: string; storage_key?: string; error?: string };
      if (!res.ok || !data.url || !data.storage_key) throw new Error(data.error ?? 'No se pudo firmar la subida');

      const put = await fetch(data.url, {
        method: 'PUT',
        body: file,
        headers: { 'content-type': 'model/gltf-binary' },
      });
      if (!put.ok) throw new Error(`R2 rechazó la subida (${put.status})`);

      setStorageKey(data.storage_key);
      setState('uploaded');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      setState('idle');
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel p-4">
        <h2 className="label mb-2">1 · Fichero GLB</h2>
        <input
          type="file"
          accept=".glb,model/gltf-binary"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setState('idle');
            setStorageKey('');
          }}
          className="input font-mono text-[12px]"
        />
        {file && (
          <p className="mt-2 font-mono text-[11px] text-text-3">
            {file.name} · {(file.size / 1e6).toFixed(2)} MB
          </p>
        )}
        <button onClick={upload} disabled={!file || state !== 'idle'} className="btn mt-3">
          {state === 'uploading' ? 'Subiendo…' : state === 'uploaded' ? 'Subido' : 'Subir a R2'}
        </button>
        {error && <p className="mt-2 font-mono text-[11px] text-accent">{error}</p>}
        {state === 'uploaded' && <p className="mt-2 font-mono text-[11px] text-ok">{storageKey}</p>}
      </div>

      <form action={registerModel} className="panel space-y-3 p-4">
        <h2 className="label">2 · Registrar el modelo</h2>
        <input type="hidden" name="storage_key" value={storageKey} />
        <input type="hidden" name="file_bytes" value={file?.size ?? ''} />

        <label className="block">
          <span className="label">Vehículo</span>
          <select name="vehicle_id" required className="input mt-1 font-mono text-[12px]">
            <option value="">— elegir —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.slug}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Código del modelo</span>
          <input
            name="code"
            required
            pattern="[A-Z0-9_]{4,64}"
            placeholder="SEAT_5F_20TDI_2017_MAIN"
            className="input mt-1 font-mono text-[12px]"
          />
        </label>

        <button type="submit" disabled={state !== 'uploaded'} className="btn btn-accent">
          Leer nodos y registrar
        </button>
        <p className="font-mono text-[10px] leading-relaxed text-text-3">
          Se crea en <span className="text-text-2">draft</span>. El mapeo nodo ↔ componente se revisa antes de
          publicar: un nodo mal mapeado enseña una pieza equivocada.
        </p>
      </form>
    </div>
  );
}
