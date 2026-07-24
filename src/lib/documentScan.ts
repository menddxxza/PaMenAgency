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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function callExtract(file: File, kind: 'inventory' | 'client'): Promise<{ items: Record<string, unknown>[] }> {
  const image = await fileToBase64(file)
  const { data, error } = await supabase.functions.invoke('extract-document', {
    body: { image, mediaType: file.type || 'image/jpeg', kind },
  })
  if (error) throw new Error('No se pudo leer el documento. Prueba con una foto más clara y con buena luz.')
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
