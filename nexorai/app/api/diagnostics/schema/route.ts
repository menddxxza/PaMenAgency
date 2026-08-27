import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Diagnóstico TEMPORAL: confirma si la migración 0004 (columnas
 * email/phone en leads) se aplicó, sin necesitar acceso SQL directo ni la
 * sesión del usuario. Borrar en cuanto se confirme. No expone datos de
 * negocio, sólo si la query en sí tiene éxito o falla por columna
 * inexistente.
 */
export async function GET() {
  const admin = createServiceRoleClient();

  const { error } = await admin.from('leads').select('email, phone').limit(1);

  return NextResponse.json({
    leads_email_phone_columns_exist: !error,
    error_detail: error ? error.message : null,
  });
}
