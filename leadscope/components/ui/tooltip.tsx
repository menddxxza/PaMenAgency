'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-lg bg-fg px-2.5 py-1.5 text-xs text-bg shadow-card-hover animate-fade-in',
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
