import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ETIQUETAS_LEAD } from '@/components/EstadoLead';
import type { Lead } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type LeadConProducto = Lead & { products: { titulo: string } | null };

function celda(valor: string): string {
  return /[",\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}

/** CSV de los mensajes del vendedor con sesión, para llevarlos a su propio CRM o Excel. */
export async function GET() {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'La base de datos no está configurada.' }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Tienes que iniciar sesión.' }, { status: 401 });

  const { data } = await supabase
    .from('leads')
    .select('*, products ( titulo )')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  const leads = (data ?? []) as unknown as LeadConProducto[];

  const cabecera = ['Fecha', 'Producto', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Mensaje', 'Estado'];
  const filas = leads.map((lead) => [
    new Date(lead.created_at).toLocaleString('es-ES'),
    lead.products?.titulo ?? '',
    lead.nombre,
    lead.email,
    lead.telefono ?? '',
    lead.empresa ?? '',
    lead.mensaje,
    ETIQUETAS_LEAD[lead.status].texto,
  ]);

  const csv = [cabecera, ...filas].map((fila) => fila.map(celda).join(',')).join('\n');
  // BOM al principio: sin esto, Excel abre las tildes mal por asumir Latin-1 en vez de UTF-8.
  const contenido = `﻿${csv}`;

  return new NextResponse(contenido, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mensajes-iapyme-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
