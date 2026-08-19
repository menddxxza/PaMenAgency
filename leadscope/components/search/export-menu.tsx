'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import type { Business } from '@/lib/types';

export function ExportMenu({ businesses, disabled }: { businesses: Business[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const options = [
    { label: 'Exportar a CSV', icon: FileJson, action: () => exportToCsv(businesses) },
    { label: 'Exportar a Excel', icon: FileSpreadsheet, action: () => exportToXlsx(businesses) },
    { label: 'Exportar a PDF', icon: FileText, action: () => exportToPdf(businesses) },
  ];

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || businesses.length === 0}
      >
        <Download className="h-4 w-4" />
        Exportar
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 animate-slide-up rounded-xl border border-border bg-surface p-1.5 shadow-card-hover">
          {options.map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={() => {
                action();
                setOpen(false);
              }}
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
