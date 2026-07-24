import { supabase } from '@/lib/supabase'

export interface ScannedInventoryRow {
  name: string
  quantity: number
  unit: string
  unitPrice: number | null
}

export interface ScannedClientRow {
  name: string
  phone: string
  email: string
  notes: string
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Una foto de móvil sin procesar puede pesar varios MB y superar el límite
// de tamaño de la función/API — la reducimos a un tamaño razonable para
// texto legible (Anthropic ya reescala por dentro a partir de ~1568px de
// lado largo, así que subir más no mejora la lectura).
async function downscaleImage(file: File, maxDimension = 1568, quality = 0.85): Promise<{ blob: Blob; mediaType: string }> {
  if (!file.type.startsWith('image/')) return { blob: file, mediaType: file.type || 'image/jpeg' }
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return { blob: file, mediaType: file.type || 'image/jpeg' }
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    return blob ? { blob, mediaType: 'image/jpeg' } : { blob: file, mediaType: file.type || 'image/jpeg' }
  } catch {
    return { blob: file, mediaType: file.type || 'image/jpeg' }
  }
}

async function extractErrorDetail(error: unknown): Promise<string | null> {
  const response = (error as { context?: Response } | null)?.context
  if (response instanceof Response) {
    try {
      const body = await response.clone().json()
      if (typeof body?.error === 'string') return body.error
    } catch {
      // el cuerpo no era JSON — no hay más detalle que extraer
    }
  }
  return null
}

async function callExtract(file: File, kind: 'inventory' | 'client'): Promise<{ items: Record<string, unknown>[] }> {
  const { blob, mediaType } = await downscaleImage(file)
  const image = await fileToBase64(blob)
  const { data, error } = await supabase.functions.invoke('extract-document', {
    body: { image, mediaType, kind },
  })
  if (error) {
    const detail = await extractErrorDetail(error)
    throw new Error(detail ?? 'No se pudo leer el documento. Prueba con una foto más clara y con buena luz.')
  }
  if (data?.error) throw new Error(data.error)
  return data as { items: Record<string, unknown>[] }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export async function scanInventoryDocument(file: File): Promise<ScannedInventoryRow[]> {
  const { items } = await callExtract(file, 'inventory')
  return items.map((item) => ({
    name: asString(item.name),
    quantity: asNumber(item.quantity),
    unit: asString(item.unit) || 'unidad',
    unitPrice: item.unit_price != null && item.unit_price !== '' ? asNumber(item.unit_price) : null,
  }))
}

export async function scanClientDocument(file: File): Promise<ScannedClientRow[]> {
  const { items } = await callExtract(file, 'client')
  return items.map((item) => ({
    name: asString(item.name),
    phone: asString(item.phone),
    email: asString(item.email),
    notes: asString(item.notes),
  }))
}
