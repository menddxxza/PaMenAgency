// Convierte una foto (albarán de proveedor, o un documento en papel con los
// datos de un cliente) en datos estructurados usando la visión de Claude,
// para que el usuario no tenga que teclear cada línea a mano: hace una foto,
// revisa lo que se ha leído y confirma antes de guardar nada. Esta función
// solo "traduce" la imagen a JSON — no lee ni escribe ningún dato del
// negocio, así que no necesita comprobar membership, solo que quien llama
// tiene una sesión válida (para no dejar la clave de Anthropic abierta a
// cualquiera sin cuenta).
//
// POST /functions/v1/extract-document
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "image": "<base64 sin el prefijo data:...>", "mediaType": "image/jpeg", "kind": "inventory" | "client" }

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROMPTS: Record<'inventory' | 'client', string> = {
  inventory: `Esta imagen es un albarán, factura de proveedor o etiqueta de stock de un negocio. Extrae cada artículo/línea que veas y responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con esta forma exacta:
{"items": [{"name": "string", "quantity": number, "unit": "string (ud, caja, ml, kg...)", "unit_price": number o null}]}
Si no puedes leer algún campo con confianza, pon null en ese campo — nunca inventes datos. Si no hay ningún artículo legible, responde {"items": []}.`,
  client: `Esta imagen es un documento o formulario en papel con los datos de un cliente (nombre, teléfono, email, notas). Extrae los datos y responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con esta forma exacta:
{"items": [{"name": "string o null", "phone": "string o null", "email": "string o null", "notes": "string o null"}]}
Normalmente hay un único cliente por documento, pero si hay varios incluye una entrada por cada uno. Si no puedes leer algún campo con confianza, pon null en ese campo — nunca inventes datos.`,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })
  }

  const callerClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: caller } = await callerClient.auth.getUser()
  if (!caller?.user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no está configurada' }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  const body = await req.json().catch(() => null)
  const kind: 'inventory' | 'client' | null =
    body?.kind === 'inventory' || body?.kind === 'client' ? body.kind : null
  if (!body?.image || !kind) {
    return new Response(JSON.stringify({ error: 'image y kind ("inventory" o "client") son obligatorios' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const mediaType = typeof body.mediaType === 'string' && body.mediaType.startsWith('image/') ? body.mediaType : 'image/jpeg'

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: body.image } },
            { type: 'text', text: PROMPTS[kind] },
          ],
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `Anthropic respondió ${anthropicRes.status}: ${detail}` }), {
      status: 502,
      headers: corsHeaders,
    })
  }

  const anthropicBody = await anthropicRes.json()
  const text = (anthropicBody.content ?? [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('')
    .trim()

  // Claude a veces envuelve el JSON en un bloque ```json aunque se le pida
  // que no lo haga — quitarlo aquí es más robusto que insistir en el prompt.
  const jsonText = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return new Response(
      JSON.stringify({ error: 'No se pudo interpretar el documento. Prueba con una foto más clara y con buena luz.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const items = Array.isArray((parsed as { items?: unknown }).items) ? (parsed as { items: unknown[] }).items : []

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
