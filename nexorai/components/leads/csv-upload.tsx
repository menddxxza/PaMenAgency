'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function CsvUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/leads/import', { method: 'POST', body: formData });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!data) {
      setError('No se pudo importar el archivo.');
      return;
    }
    if (!res.ok && data.imported === 0 && data.errors?.length) {
      setResult(data);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? 'No se pudo importar el archivo.');
      return;
    }

    setResult(data);
    if (data.imported > 0) router.refresh();
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => inputRef.current?.click()} loading={loading}>
          <UploadCloud className="h-3.5 w-3.5" />
          Importar leads (CSV)
        </Button>
        <p className="text-xs text-muted">
          Columnas: <code className="text-fg">name</code>, <code className="text-fg">email</code> y/o{' '}
          <code className="text-fg">phone</code>, opcional <code className="text-fg">estimated_value</code>.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result && (
        <p className="text-sm text-muted">
          {result.imported} lead{result.imported === 1 ? '' : 's'} importado{result.imported === 1 ? '' : 's'}
          {result.skipped > 0 && `, ${result.skipped} fila(s) ignorada(s)`}.
          {result.errors.length > 0 && (
            <span className="mt-1 block text-xs">{result.errors.slice(0, 5).join(' ')}</span>
          )}
        </p>
      )}
    </div>
  );
}
