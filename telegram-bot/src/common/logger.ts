import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

// Log de auditoría en texto plano: quién pidió qué y qué se ejecutó.
// Imprescindible para el bot personal, que puede tocar archivos y procesos.
export function audit(botName: string, line: string) {
  const logPath = join(process.cwd(), 'logs', `${botName}.log`)
  mkdirSync(dirname(logPath), { recursive: true })
  const stamp = new Date().toISOString()
  appendFileSync(logPath, `[${stamp}] ${line}\n`)
  console.log(`[${botName}] ${line}`)
}
