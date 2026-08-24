'use client';

import { useState } from 'react';
import { Topbar } from '@/components/dashboard/topbar';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/components/providers/auth-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { useToast } from '@/components/providers/toast-provider';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { theme, toggle } = useTheme();
  const { push } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    setSaving(false);
    push(error ? 'No se pudo guardar' : 'Perfil actualizado', error ? 'error' : 'success');
  }

  return (
    <>
      <Topbar title="Ajustes" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <Card className="max-w-lg p-5">
          <h2 className="text-sm font-semibold text-fg">Perfil</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled />
            </div>
            <Button onClick={handleSave} loading={saving}>
              Guardar cambios
            </Button>
          </div>
        </Card>

        <Card className="max-w-lg p-5">
          <h2 className="text-sm font-semibold text-fg">Apariencia</h2>
          <div className="mt-4">
            <Switch checked={theme === 'dark'} onChange={toggle} label="Modo oscuro" />
          </div>
        </Card>
      </main>
    </>
  );
}
