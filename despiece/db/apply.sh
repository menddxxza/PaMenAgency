#!/usr/bin/env bash
# Aplica esquema + migraciones + seed sobre una base de datos Postgres.
#
#   ./db/apply.sh "postgresql://..."          # esquema + migraciones + seed
#   ./db/apply.sh "postgresql://..." --no-seed
#
# Idempotente: se puede repetir sobre una base ya aplicada.
set -euo pipefail

DB_URL="${1:-${DATABASE_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "uso: $0 <DATABASE_URL> [--no-seed]" >&2
  exit 64
fi
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PSQL=(psql "$DB_URL" -v ON_ERROR_STOP=1 -q)

echo "→ schema.sql"
"${PSQL[@]}" -f "$HERE/schema.sql"

for f in "$HERE"/migrations/*.sql; do
  echo "→ migrations/$(basename "$f")"
  "${PSQL[@]}" -f "$f"
done

if [ "${2:-}" != "--no-seed" ]; then
  echo "→ seed.sql (origin = demo)"
  "${PSQL[@]}" -f "$HERE/seed.sql"
fi

echo "listo"
