import { getSesion } from '@/lib/sesion';
import { consumoIa } from '@/lib/ia/limites';
import PanelApp from '@/components/panel/PanelApp';

export const metadata = { title: 'Tareas · Notiq' };

export default async function TareasPage() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const consumo = await consumoIa(sesion.userId, sesion.plan);

  return (
    <PanelApp tabInicial="tareas" email={sesion.email} plan={sesion.plan} consumoIa={consumo} />
  );
}
