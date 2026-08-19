'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

export function Topbar({ title }: { title?: string }) {
  const { profile } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <h1 className="text-base font-semibold text-fg">{title}</h1>

      <div className="flex items-center gap-3">
        {profile?.plan === 'free' && (
          <Link
            href="/dashboard/billing"
            className={buttonVariants({ variant: 'brand', size: 'sm' })}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mejorar a Pro
          </Link>
        )}
        {profile?.plan === 'pro' && <Badge variant="brand">Plan Pro</Badge>}
        <ThemeToggle />
      </div>
    </header>
  );
}
