import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { BotTone, Database } from '@/types/database.types'

type BotConfig = Database['public']['Tables']['bot_config']['Row']

export function Configuracion() {
  const { activeBusinessId } = useTenant()
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!activeBusinessId) return
    supabase
      .from('bot_config')
      .select('*')
      .eq('business_id', activeBusinessId)
      .single()
      .then(({ data }) => setConfig(data))
  }, [activeBusinessId])

  async function handleSave() {
    if (!config) return
    setSaving(true)
    await supabase
      .from('bot_config')
      .update({ tone: config.tone, greeting_message: config.greeting_message })
      .eq('business_id', config.business_id)
    setSaving(false)
  }

  if (!config) return <div className="page">Cargando…</div>

  return (
    <div className="page">
      <h1>Configuración del bot</h1>
      <label>
        Tono
        <select
          value={config.tone}
          onChange={(e) => setConfig({ ...config, tone: e.target.value as BotTone })}
        >
          <option value="cercano">Cercano</option>
          <option value="profesional">Profesional</option>
          <option value="directo">Directo</option>
          <option value="divertido">Divertido</option>
        </select>
      </label>
      <label>
        Mensaje de bienvenida
        <textarea
          value={config.greeting_message}
          onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })}
        />
      </label>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  )
}
