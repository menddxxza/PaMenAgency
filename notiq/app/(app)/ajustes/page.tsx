import { getSesion } from '@/lib/sesion';
import { consumoIa } from '@/lib/ia/limites';
import PanelApp from '@/components/panel/PanelApp';

export const metadata = { title: 'Ajustes · Notiq' };

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const { pago } = await searchParams;
  const sesion = await getSesion();
  if (!sesion) return null;

  const consumo = await consumoIa(sesion.userId, sesion.plan);

  return (
    <PanelApp
      tabInicial="ajustes"
      email={sesion.email}
      plan={sesion.plan}
      consumoIa={consumo}
      pago={pago}
    />
  );
}
