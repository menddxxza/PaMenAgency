'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Topbar({ organizationName, plan }: { organizationName: string; plan: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <div>
        <p className="text-sm font-medium text-fg">{organizationName}</p>
        <Badge variant="brand" className="mt-0.5 capitalize">
          Plan {plan}
        </Badge>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Salir
      </Button>
    </header>
  );
}
