import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo donde hay sesión: la landing y las páginas legales ya no esperan a Supabase Auth.
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
