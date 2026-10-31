#!/usr/bin/env bash
# Arranca backend (FastAPI) y frontend (Next.js) en local, sin Docker.
# Uso: ./scripts/dev.sh
set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

if [[ ! -x .venv/bin/python ]]; then
  echo "No existe .venv. Créalo con: python3.14 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "No existe .env. Copiando .env.example..."
  cp .env.example .env
fi

if [[ ! -d web/node_modules ]]; then
  echo "Instalando dependencias del frontend..."
  (cd web && pnpm install --frozen-lockfile)
fi

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && exec 3>&- && return 0 || return 1
}

if port_in_use "$BACKEND_PORT"; then
  echo "El puerto $BACKEND_PORT ya está ocupado (¿backend ya iniciado?)." >&2
  exit 1
fi
if port_in_use "$FRONTEND_PORT"; then
  echo "El puerto $FRONTEND_PORT ya está ocupado (¿frontend ya iniciado?)." >&2
  exit 1
fi

echo "Aplicando migraciones y datos iniciales..."
.venv/bin/alembic upgrade head
.venv/bin/python -m app.initial_data

mkdir -p /tmp/opencode
BACKEND_LOG="/tmp/opencode/informatech-backend.log"
FRONTEND_LOG="/tmp/opencode/informatech-frontend.log"

kill_tree() {
  local pid="$1"
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

cleanup() {
  echo
  echo "Deteniendo servidores..."
  [[ -n "${BACKEND_PID:-}" ]] && kill_tree "$BACKEND_PID"
  [[ -n "${FRONTEND_PID:-}" ]] && kill_tree "$FRONTEND_PID"
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Iniciando backend en http://$BACKEND_HOST:$BACKEND_PORT (logs: $BACKEND_LOG)"
.venv/bin/uvicorn app.main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT" --reload >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Espera a que el backend responda antes de arrancar el frontend.
for _ in $(seq 1 40); do
  if curl -fsS "http://$BACKEND_HOST:$BACKEND_PORT/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS "http://$BACKEND_HOST:$BACKEND_PORT/health" >/dev/null 2>&1; then
  echo "El backend no arrancó. Revisa $BACKEND_LOG" >&2
  tail -30 "$BACKEND_LOG" >&2 || true
  exit 1
fi

echo "Iniciando frontend en http://localhost:$FRONTEND_PORT (logs: $FRONTEND_LOG)"
(cd web && pnpm dev --port "$FRONTEND_PORT") >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

echo
echo "Listo:"
echo "  API:  http://localhost:$BACKEND_PORT/docs"
echo "  Web:  http://localhost:$FRONTEND_PORT"
echo "  Admin: admin@example.com / Admin12345"
echo
echo "Pulsa Ctrl+C para detener ambos servidores."

wait
