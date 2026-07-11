import { createClient } from '@supabase/supabase-js'

// Sin el generic <Database> por ahora: nuestro database.types.ts es manual y
// no incluye `Relationships`, lo que rompe la inferencia de supabase-js en
// queries con joins (.select('foo(*)')) y en insert/update. En cuanto se
// enlace el proyecto real y se generen los tipos con
// `supabase gen types typescript`, volver a pasarlo como
// createClient<Database>(...) para recuperar el tipado estricto de filas.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en el .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
