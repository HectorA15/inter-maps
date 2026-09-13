<div align="center">
  <h1>InterMaps</h1>
  <p><b>Sistema interactivo de mapas para el Instituto Tecnológico de Nuevo León.</b></p>
</div>

InterMaps es un monorepo compuesto por una API REST en Spring Boot y una interfaz web en React. La aplicación permite consultar edificios, plantas, espacios y rutas del campus.

## Arquitectura

```text
Navegador -> React/Vite -> proxy /api -> Spring Boot -> SQLite
```

Spring Boot funciona como backend: recibe peticiones HTTP, consulta SQLite y devuelve DTOs JSON. React funciona como frontend: consume esos DTOs y dibuja el mapa y el panel de información.

## Tecnologías

- Java 25
- Spring Boot 4.1
- SQLite
- React
- TypeScript
- Vite
- MapLibre

## Requisitos

Existen dos formas de ejecutar el proyecto.

### Opción A: Docker, recomendada para el equipo

Instalar Git y Docker Desktop. Desde la raíz del repositorio:

```bash
docker compose up --build
```

Abrir `http://localhost:5173`.

Docker proporciona versiones consistentes de Java y Node.js para todos los integrantes. La base SQLite se mantiene en `backend/intermaps.db` dentro de la carpeta del proyecto para conservar los datos entre reinicios. Para detener los servicios:

```bash
docker compose down
```

### Opción B: herramientas locales

Instalar:

- [JDK 25](https://www.oracle.com/java/technologies/downloads/)
- [Node.js 20](https://nodejs.org/)
- Git

El repositorio incluye `.nvmrc` y `backend/.java-version` para documentar las versiones esperadas. Maven no necesita instalarse porque el backend incluye Maven Wrapper.

Instalar dependencias del frontend y arrancar ambos servicios:

```bash
cd web
npm ci
cd ..
./dev.sh
```

Abrir `http://localhost:5173`.

En Windows se puede ejecutar el backend y frontend en dos terminales:

```text
Terminal 1:
cd backend
mvnw.cmd spring-boot:run

Terminal 2:
cd web
npm ci
npm run dev
```

## Configuración de la API

Durante el desarrollo, Vite reenvía automáticamente las rutas `/api` a `http://localhost:8080`. Por eso no es necesario crear `web/.env`.

Si el backend está en otro origen, copiar `web/.env.example` a `web/.env` y definir:

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

No subir nunca `web/.env`, tokens ni contraseñas.

## Datos locales

Cada desarrollador debe utilizar su propia base SQLite. El catálogo inicial está versionado en:

```text
backend/src/main/resources/edificios.json
```

El archivo `backend/intermaps.db` es estado local generado por el backend; no debe utilizarse para compartir cambios entre personas. Si se necesita reconstruir la base, detener el backend y eliminar únicamente ese archivo local antes de arrancar de nuevo.

## Validaciones

Frontend:

```bash
cd web
npm run build
npm test -- --run
```

Backend:

```bash
cd backend
./mvnw test
```

## Trabajo en equipo

No trabajar directamente sobre `main`. Crear una rama por tarea y abrir un Pull Request:

```bash
git switch main
git pull --rebase origin main
git switch -c feature/nombre-de-la-tarea
```

La guía completa de ramas, commits, Pull Requests y conflictos está en [CONTRIBUTING.md](CONTRIBUTING.md).
