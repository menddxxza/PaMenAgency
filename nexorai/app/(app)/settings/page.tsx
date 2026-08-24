import { requireOrgContext } from '@/lib/server/org-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label, Input } from '@/components/ui/input';

export default async function SettingsPage() {
  const { organization, business, userEmail } = await requireOrgContext();

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

      {business && (
        <Card>
          <CardHeader>
            <CardTitle>Negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre del negocio</Label>
              <Input value={business.name} disabled />
            </div>
            <div>
              <Label>Sector</Label>
              <Input value={business.sector} disabled />
            </div>
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
