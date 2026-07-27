import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (revisa tu .env)`)
  }
  return value
}

export const env = {
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.2',

  supabaseUrl: () => required('SUPABASE_URL'),
  supabaseServiceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),

  supportBotToken: () => required('SUPPORT_BOT_TOKEN'),

  personalBotToken: () => required('PERSONAL_BOT_TOKEN'),
  ownerChatIds: (): number[] =>
    required('OWNER_CHAT_IDS')
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isFinite(id)),
  workspaceDir: process.env.WORKSPACE_DIR ?? process.cwd(),
  execTimeoutMs: Number(process.env.EXEC_TIMEOUT_MS ?? 20_000),
  execMaxOutputChars: Number(process.env.EXEC_MAX_OUTPUT_CHARS ?? 3500),
}
