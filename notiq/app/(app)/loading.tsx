import IconoCarga from '@/components/ui/IconoCarga';

/**
 * Se muestra automáticamente (convención loading.tsx de Next.js) mientras
 * AppLayout hace su comprobación de sesión — antes no había nada aquí, así
 * que ese hueco se veía como una pantalla en blanco un instante al entrar en
 * la app o recargar cualquier pestaña.
 */
export default function Cargando() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center bg-surface">
      <IconoCarga />
    </div>
  );
}
