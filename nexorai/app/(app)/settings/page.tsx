import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireOrgContext } from '@/lib/server/org-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label, Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function SettingsPage() {
  const { organization, business, businesses, businessLimit, userEmail } = await requireOrgContext();
  const canAddBusiness = businesses.length < businessLimit;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Configuración</p>
        <h1 className="mt-1 text-2xl font-semibold text-fg">Tu cuenta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input value={organization.name} disabled />
          </div>
          <div>
            <Label>Email de la cuenta</Label>
            <Input value={userEmail} disabled />
          </div>
          <div>
            <Label>Plan</Label>
            <Input value={organization.plan} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      {businesses.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              Negocios
              <span className="ml-2 font-normal text-muted">
                ({businesses.length}/{businessLimit === Infinity ? '∞' : businessLimit})
              </span>
            </CardTitle>
            {canAddBusiness ? (
              <Link href="/onboarding/business">
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                  Añadir negocio
                </Button>
              </Link>
            ) : (
              <Link href="/billing">
                <Button variant="ghost" size="sm">
                  Ampliar plan
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-fg">{b.name}</p>
                  <p className="text-xs text-muted">{b.sector}</p>
                </div>
                {b.id === business?.id && <Badge variant="brand">Activo</Badge>}
              </div>
            ))}
            {!canAddBusiness && (
              <p className="text-xs text-muted">
                Has alcanzado el límite de negocios de tu plan actual. Amplía tu plan para conectar más.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Privacidad y datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>
            Puedes leer nuestra{' '}
            <a
              href="https://pamenagency.com/legal/privacidad"
              target="_blank"
              rel="noreferrer"
              className="text-fg underline underline-offset-2"
            >
              Política de privacidad
            </a>{' '}
            y nuestra{' '}
            <a
              href="https://pamenagency.com/legal/tratamiento-de-datos"
              target="_blank"
              rel="noreferrer"
              className="text-fg underline underline-offset-2"
            >
              Política de tratamiento de datos
            </a>{' '}
            en pamenagency.com.
          </p>
          <p>
            La exportación y el borrado completo de datos de la cuenta todavía no están automatizados en
            este entorno de demostración; escríbenos y lo gestionamos manualmente mientras tanto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
