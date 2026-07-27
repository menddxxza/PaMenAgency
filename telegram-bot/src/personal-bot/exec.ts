import { exec } from 'node:child_process'
import { env } from '../common/env.js'

export type ExecResult = { ok: boolean; output: string }

// Ejecuta un comando de shell en el workspace configurado, con timeout y
// límite de salida para que un comando colgado o muy verboso no se coma el
// proceso del bot. No hay sandbox de sistema operativo aquí: quien controle
// el chat_id autorizado controla esta máquina, así que la seguridad real
// está en quién tiene acceso al bot (ver README).
export function runShellCommand(cmd: string, cwd = env.workspaceDir): Promise<ExecResult> {
  return new Promise((resolve) => {
    exec(
      cmd,
      { cwd, timeout: env.execTimeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const raw = [stdout, stderr].filter(Boolean).join('\n').trim()
        const output = raw.length > env.execMaxOutputChars
          ? `${raw.slice(0, env.execMaxOutputChars)}\n… (salida truncada)`
          : raw

        if (error) {
          resolve({ ok: false, output: output || error.message })
          return
        }
        resolve({ ok: true, output: output || '(sin salida)' })
      },
    )
  })
}
