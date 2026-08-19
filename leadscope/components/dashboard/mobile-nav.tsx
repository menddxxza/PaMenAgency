'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, History, CreditCard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard/search', label: 'Buscar', icon: Search },
  { href: '/dashboard/history', label: 'Historial', icon: History },
  { href: '/dashboard/billing', label: 'Plan', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
              active ? 'text-brand-600 dark:text-brand-400' : 'text-muted'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
