import type { Product } from '@/lib/database.types';

const EUROS = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function euros(cantidad: number): string {
  return EUROS.format(cantidad);
}

export function tiempoInstalacion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = minutos / 60;
  if (horas < 24) return horas === 1 ? '1 hora' : `${Number(horas.toFixed(1))} horas`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? '1 día' : `${dias} días`;
}

/** Precio de una ficha, resumido para la tarjeta y la ficha de producto. */
export function precioResumido(producto: Pick<
  Product,
  'pricing_model' | 'precio_setup' | 'precio_mensual' | 'precio_unico'
>): { principal: string; secundario: string | null } {
  switch (producto.pricing_model) {
    case 'free':
      return { principal: 'Gratis', secundario: null };
    case 'one_time':
      return { principal: euros(producto.precio_unico), secundario: 'pago único' };
    case 'monthly':
      return { principal: `${euros(producto.precio_mensual)}`, secundario: 'al mes' };
    default:
      return {
        principal: euros(producto.precio_setup),
        secundario:
          producto.precio_mensual > 0
            ? `+ ${euros(producto.precio_mensual)}/mes`
            : 'instalación incluida',
      };
  }
}

export const NOMBRE_TIPO: Record<Product['product_type'], string> = {
  automation: 'Automatización',
  agent: 'Agente de IA',
  bot: 'Bot',
  app: 'App',
  web: 'Web',
  saas: 'SaaS',
  script: 'Script',
  template: 'Template',
  service: 'Servicio',
};
