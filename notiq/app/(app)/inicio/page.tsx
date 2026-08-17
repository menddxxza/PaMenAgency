import { getSesion } from '@/lib/sesion';
import { consumoIa } from '@/lib/ia/limites';
import PanelApp from '@/components/panel/PanelApp';

export const metadata = { title: 'Inicio · Notiq' };

export default async function InicioPage() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const consumo = await consumoIa(sesion.userId, sesion.plan);

  return (
    <PanelApp tabInicial="inicio" email={sesion.email} plan={sesion.plan} consumoIa={consumo} />
  );
}
