'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, History, CreditCard, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Logomark } from '@/components/logomark';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard/search', label: 'Buscador', icon: Search },
  { href: '/dashboard/history', label: 'Historial', icon: History },
  { href: '/dashboard/billing', label: 'Plan y facturación', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/50 lg:flex">
      <div className="flex h-16 items-center gap-2 px-6 font-display font-semibold text-fg">
        <Logomark />
        LeadScope
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-muted hover:bg-surface-hover hover:text-fg'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
