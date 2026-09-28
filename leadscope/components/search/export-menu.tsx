'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers/toast-provider';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import type { Business } from '@/lib/types';

export function ExportMenu({
  businesses,
  selectedBusinesses,
  disabled,
}: {
  businesses: Business[];
  selectedBusinesses?: Business[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { push } = useToast();

  const hasSelection = !!selectedBusinesses && selectedBusinesses.length > 0;
  const target = hasSelection ? selectedBusinesses! : businesses;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function run(label: string, action: () => Promise<void>) {
    setOpen(false);
    try {
      await action();
      push(`${label}: ${target.length} negocios exportados`, 'success');
    } catch {
      push('No se pudo generar el archivo', 'error');
    }
  }

  const options = [
    { label: 'Exportar a CSV', icon: FileJson, action: () => exportToCsv(target) },
    { label: 'Exportar a Excel', icon: FileSpreadsheet, action: () => exportToXlsx(target) },
    { label: 'Exportar a PDF', icon: FileText, action: () => exportToPdf(target) },
  ];

  return (
    <div className="relative" ref={ref}>
      <Button
        variant={hasSelection ? 'brand' : 'secondary'}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || target.length === 0}
      >
        <Download className="h-4 w-4" />
        {hasSelection ? `Exportar seleccionados (${selectedBusinesses!.length})` : 'Exportar'}
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 animate-slide-up rounded-xl border border-border bg-surface p-1.5 shadow-card-hover">
          {options.map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={() => run(label, action)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-fg hover:bg-surface-hover"
            >
              <Icon className="h-4 w-4 text-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
