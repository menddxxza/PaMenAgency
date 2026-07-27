import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type CommandEntry = { cmd: string; cwd?: string; description?: string }

const COMMANDS_FILE = process.env.COMMANDS_FILE ?? join(process.cwd(), 'commands.json')

// Comandos "de confianza": alias cortos que corren siempre el mismo comando
// fijo (desplegar, reiniciar, ver estado…), sin necesitar confirmación cada
// vez porque ya se han revisado una vez al escribir commands.json. Todo lo
// que no esté en esta lista pasa por /exec, que sí pide confirmación.
export function loadCommands(): Record<string, CommandEntry> {
  if (!existsSync(COMMANDS_FILE)) return {}
  try {
    return JSON.parse(readFileSync(COMMANDS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}
