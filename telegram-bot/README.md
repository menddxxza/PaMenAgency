# Bots de Telegram de Atiende

Dos bots independientes, cada uno con su propio token de Telegram, pensados
para correr **gratis** (sin coste de hosting obligatorio ni de tokens de
IA de pago) en una máquina que tú controles — tu ordenador, un Raspberry Pi,
o una VPS barata. Usan *long polling*, así que no necesitan URL pública ni
webhook: solo conexión a internet saliente.

## 1. Bot de soporte (`support-bot`) — de cara a tus clientes

Es el canal de Telegram para los negocios que se suscriben a
[atiendeapp.es](https://www.atiendeapp.es), igual que ya existe un canal de
WhatsApp (`supabase/functions/whatsapp-inbound`). Un cliente escribe
`/vincular <slug-del-negocio>` (o abre un enlace `t.me/tu_bot?start=slug`) y
a partir de ahí conversa con el bot, que responde con el tono configurado
en el panel de Atiende (tabla `bot_config`, columna `tone`:
`cercano` / `profesional` / `directo` / `divertido`) — cambiar el tono desde
el panel cambia cómo habla el bot sin tocar código.

Las respuestas las genera un modelo de lenguaje **local** vía
[Ollama](https://ollama.com), no una API de pago: cero coste por token. No
hace falta "entrenarlo" ni darle muchos archivos — el contexto del negocio
(nombre, saludo, base de conocimiento) sale de `bot_config.knowledge_base`
y se inyecta en cada respuesta.

Si un cliente pregunta directamente si habla con un bot o una IA, el
asistente lo dice con naturalidad (no está instruido para negarlo): además
de ser lo correcto, es un requisito de transparencia para asistentes
conversacionales en la UE.

## 2. Bot personal (`personal-bot`) — solo para ti

Un segundo bot, con otro token, que **solo responde a los `chat_id` que
pongas en `OWNER_CHAT_IDS`** — cualquier otro mensaje se ignora en
silencio. Te deja:

- `/comandos` y `/comando <alias>` — comandos predefinidos en
  `commands.json` (ver `commands.example.json`): cosas como desplegar,
  hacer `git pull`, reiniciar un servicio... revisados una vez y listos
  para lanzar con un alias corto.
- `/exec <comando>` — ejecuta **cualquier** comando de shell en
  `WORKSPACE_DIR`, pero primero te pide confirmar con `/confirmar` (60s de
  margen) o cancelar con `/cancelar`. Es la vía de "acceso amplio" que
  pediste: úsala sabiendo que ejecuta lo que le escribas, tal cual.
- `/tono` — cambia el registro con el que te habla en la charla normal
  (cercano, profesional, directo, divertido).
- Todo lo demás, texto suelto, lo contesta el modelo local (Ollama), como
  una charla normal.

Todo lo que ejecuta queda en `logs/personal-bot.log` (comando, quién lo
pidió, resultado).

### Seguridad — léelo antes de desplegarlo

Este bot puede tocar tu sistema de archivos y lanzar procesos. Eso significa
que **quien tenga tu `PERSONAL_BOT_TOKEN` o acceso al chat de un
`OWNER_CHAT_IDS` autorizado, controla esa máquina**. Recomendaciones:

- No despliegues este bot en el mismo servidor donde corre la app de tus
  clientes (atiendeapp.es); usa tu propio ordenador o una máquina aparte.
- No compartas `PERSONAL_BOT_TOKEN` ni el `.env` con nadie, ni lo subas al repo (ya está en `.gitignore` vía `.env`).
- Revisa `OWNER_CHAT_IDS` — solo tu chat_id (y el de quien realmente deba
  tener este nivel de acceso).
- Revisa de vez en cuando `logs/personal-bot.log`.
- Si algún día quieres restringirlo, baja `EXEC_TIMEOUT_MS`/`WORKSPACE_DIR`
  o quita `/exec` y usa solo `commands.json` con comandos concretos.

## Puesta en marcha

1. **Crea los bots (gratis):** habla con [@BotFather](https://t.me/BotFather)
   en Telegram, `/newbot` dos veces (uno para soporte, otro personal), y
   guarda los dos tokens.
2. **Averigua tu chat_id:** habla con [@userinfobot](https://t.me/userinfobot),
   te lo da directamente.
3. **Instala Ollama** (https://ollama.com) y descarga un modelo pequeño:
   ```
   ollama pull llama3.2
   ```
4. **Configura el entorno:**
   ```
   cp .env.example .env
   # rellena SUPPORT_BOT_TOKEN, PERSONAL_BOT_TOKEN, OWNER_CHAT_IDS,
   # SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
   cp commands.example.json commands.json   # opcional, para el bot personal
   ```
5. **Aplica la migración** `supabase/migrations/0003_telegram_channel.sql` y
   despliega la función `supabase/functions/telegram-inbound` (igual que ya
   despliegas `whatsapp-inbound`).
6. **Instala dependencias y arranca:**
   ```
   npm install
   npm run dev:soporte     # bot de cara a tus clientes
   npm run dev:personal    # bot solo para ti (en otra terminal)
   ```

Ambos procesos deben quedarse corriendo (usa `pm2`, un servicio systemd, o
lo que prefieras) para que el bot "esté siempre disponible" incluso cuando
tú no estés delante del ordenador.
