// Edge Function que n8n consulta para leer la configuración del bot de un
// negocio (tono, mensaje de bienvenida, base de conocimiento) antes de
// generar una respuesta. Permite cambiar el comportamiento del bot desde el
// panel (tabla bot_config) sin tocar el workflow de n8n.
//
// GET /functions/v1/get-business-config?business_id=uuid
// Invocar con la service_role key.

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const businessId = url.searchParams.get('business_id')

  if (!businessId) {
    return new Response(JSON.stringify({ error: 'business_id es obligatorio' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data, error } = await supabase
    .from('bot_config')
    .select('tone, greeting_message, knowledge_base')
    .eq('business_id', businessId)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
