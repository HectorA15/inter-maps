#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Iniciando entorno de desarrollo para InterMaps..."

if ! command -v java >/dev/null 2>&1; then
    echo "Error: Java 25 o compatible no está instalado." >&2
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "Error: Node.js y npm no están instalados." >&2
    exit 1
fi

if [ ! -d "$ROOT_DIR/web/node_modules" ]; then
    echo "==> Instalando dependencias del frontend..."
    (cd "$ROOT_DIR/web" && npm ci)
fi

echo "==> Iniciando Backend (Spring Boot)..."
(cd "$ROOT_DIR/backend" && ./mvnw spring-boot:run) &
BACKEND_PID=$!

echo "==> Iniciando Frontend Web..."
(cd "$ROOT_DIR/web" && npm run dev) &
WEB_PID=$!

cleanup() {
    echo ""
    echo "Apagando servicios..."
    kill "$BACKEND_PID" "$WEB_PID" 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT
trap cleanup SIGTERM

wait "$BACKEND_PID" "$WEB_PID"