'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Sin permiso de portapapeles: no hay nada más que ofrecer aquí.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copiado' : 'Copiar'}
      className={cn('shrink-0 text-muted transition-colors hover:text-fg', className)}
    >
      <span className="relative block h-3 w-3">
        <Copy
          className={cn(
            'absolute inset-0 h-3 w-3 transition-all duration-150',
            copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        <Check
          className={cn(
            'absolute inset-0 h-3 w-3 text-success transition-all duration-150',
            copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        />
      </span>
    </button>
  );
}
