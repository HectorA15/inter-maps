#!/bin/bash

echo "Iniciando entorno de desarrollo para InterMaps..."

# Levantar el Backend (Spring Boot con Maven Wrapper) en segundo plano
echo "==> Iniciando Backend (Spring Boot)..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!

# Levantar el Frontend Web (Vite) en segundo plano
echo "==> Iniciando Frontend Web..."
cd ../web
npm run dev &
WEB_PID=$!

# Función para apagar todo limpiamente si presionas Ctrl+C
cleanup() {
    echo ""
    echo "Apagando servicios..."
    kill $BACKEND_PID $WEB_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Mantener el script activo esperando procesos
wait