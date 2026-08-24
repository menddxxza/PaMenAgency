'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Bot, FileSearch, CreditCard, Settings } from 'lucide-react';
import { Logomark, Wordmark } from '@/components/logomark';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/audit', label: 'AI Audit', icon: FileSearch },
  { href: '/opportunities', label: 'Oportunidades', icon: Target },
  { href: '/agents', label: 'Agentes', icon: Bot },
  { href: '/billing', label: 'Facturación', icon: CreditCard },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface/40 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Logomark />
        <Wordmark className="text-sm" />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-brand-500/10 text-brand-300' : 'text-muted hover:bg-surface-hover hover:text-fg'
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <a href="https://pamenagency.com" target="_blank" rel="noreferrer" className="text-xs text-muted hover:text-fg">
          Un producto de PaMenAgency
        </a>
      </div>
    </aside>
  );
}
