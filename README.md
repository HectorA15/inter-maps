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

## Instalación y ejecución

Hay dos formas de ejecutar InterMaps. **Docker es la opción recomendada para el equipo**, porque todos utilizan las mismas versiones de Java, Node.js y dependencias. La ejecución manual es útil para trabajar directamente con el código y depurar desde el IDE.

### 1. Obtener el proyecto

Instalar [Git](https://git-scm.com/downloads) y clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd inter-maps
```

Para comprobar que se está trabajando desde la raíz correcta, deben existir las carpetas `backend`, `web` y el archivo `docker-compose.yml`.

### 2. Opción recomendada: Docker Compose

#### Instalar Docker

- Windows/macOS: instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- Linux: instalar [Docker Engine y Docker Compose](https://docs.docker.com/engine/install/).

Comprobar la instalación:

```bash
docker --version
docker compose version
```

#### Iniciar la aplicación

Desde la raíz del repositorio:

```bash
docker compose up --build
```

La primera ejecución puede tardar porque Docker descarga las imágenes y construye los contenedores. Cuando los servicios estén listos, abrir:

```text
http://localhost:5173
```

La arquitectura de desarrollo con Docker es:

```text
Navegador
    │
    ▼
Frontend React/Vite: http://localhost:5173
    │ /api
    ▼
Backend Spring Boot: http://localhost:8080
    │
    ▼
SQLite
```

El backend y el frontend se comunican dentro de la red de Docker. El navegador solo necesita acceder al frontend.

#### Comandos habituales de Docker

Detener los servicios sin eliminar los datos:

```bash
docker compose down
```

Iniciar nuevamente sin reconstruir:

```bash
docker compose up
```

Reconstruir después de cambiar `package.json`, `pom.xml` o un Dockerfile:

```bash
docker compose up --build
```

Ver los logs:

```bash
docker compose logs -f
```

Reiniciar un servicio específico:

```bash
docker compose restart backend
docker compose restart frontend
```

La base SQLite local se guarda en `backend/intermaps.db`. No debe subirse a Git ni compartirse entre desarrolladores. Para reconstruirla desde `edificios.json`, detener los servicios y eliminar únicamente ese archivo:

```bash
docker compose down
rm backend/intermaps.db
docker compose up
```

En Windows se puede eliminar `backend/intermaps.db` desde el explorador de archivos.

### 3. Opción manual: Java, Node.js y npm

#### Instalar herramientas

Instalar:

- [JDK 25](https://www.oracle.com/java/technologies/downloads/)
- [Node.js 20 LTS](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

No es necesario instalar Maven: el backend incluye Maven Wrapper (`mvnw` para Linux/macOS y `mvnw.cmd` para Windows).

Comprobar las versiones:

```bash
java --version
node --version
npm --version
```

La versión de Java debe ser 25 y la versión de Node.js debe ser 20 o superior. Los archivos `.nvmrc` y `backend/.java-version` documentan las versiones esperadas.

#### Instalar dependencias del frontend

Desde la raíz del repositorio:

```bash
cd web
npm ci
cd ..
```

`npm ci` utiliza exactamente las versiones guardadas en `package-lock.json`. Debe preferirse sobre `npm install` cuando se instala el proyecto desde cero.

#### Iniciar ambos servicios automáticamente

En Linux o macOS:

```bash
./dev.sh
```

Abrir:

```text
http://localhost:5173
```

Para detener ambos servicios, presionar `Ctrl+C` en la terminal donde se ejecuta `dev.sh`.

#### Iniciar los servicios manualmente

Si `dev.sh` no funciona o se necesita ver los logs por separado, abrir dos terminales.

Linux/macOS, terminal 1 — backend:

```bash
cd backend
./mvnw spring-boot:run
```

Windows, terminal 1 — backend:

```bat
cd backend
mvnw.cmd spring-boot:run
```

Linux/macOS o Windows, terminal 2 — frontend:

```bash
cd web
npm ci
npm run dev
```

Abrir `http://localhost:5173` cuando ambos servicios estén ejecutándose.

#### Comprobar que el backend funciona

Con el backend iniciado, abrir en el navegador:

```text
http://localhost:8080/api/v1/catalogo/buscar?nombre=edificio
```

También se puede comprobar desde una terminal:

```bash
curl "http://localhost:8080/api/v1/catalogo/buscar?nombre=edificio"
```

La respuesta debe ser un arreglo JSON con resultados. Si el backend no responde, revisar primero la terminal donde se inició Spring Boot.

## Configuración de la API

Durante el desarrollo, Vite reenvía automáticamente las rutas `/api` a `http://localhost:8080`. Por eso no es necesario crear `web/.env` para una instalación normal.

Si el backend está en otro origen, copiar `web/.env.example` a `web/.env` y definir:

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Después de modificar `.env`, reiniciar Vite. Las variables `VITE_*` se cargan al iniciar el frontend.

No subir nunca `web/.env`, tokens ni contraseñas.

## Solución de problemas frecuentes

### `java: command not found` o Java tiene una versión incorrecta

Instalar JDK 25 y comprobar:

```bash
java --version
```

Si hay varias versiones instaladas, seleccionar Java 25 como versión activa en el sistema o en el IDE.

### `npm: command not found`

Instalar Node.js desde [nodejs.org](https://nodejs.org/) y abrir una terminal nueva. Comprobar:

```bash
node --version
npm --version
```

### El frontend muestra errores de API o no carga la información de edificios

Comprobar que Spring Boot está ejecutándose en el puerto `8080` y que esta URL devuelve JSON:

```text
http://localhost:8080/api/v1/catalogo/buscar?nombre=edificio
```

Si se modificó `web/.env`, reiniciar Vite.

### El puerto 5173 o 8080 ya está ocupado

Cerrar el proceso que usa el puerto o detener una ejecución anterior de InterMaps. No iniciar dos veces el backend o el frontend.

### La base de datos parece incompleta o tiene datos antiguos

Detener el backend, eliminar `backend/intermaps.db` y arrancar nuevamente. La base se reconstruirá usando los datos versionados de `backend/src/main/resources/edificios.json`.

### Docker no inicia

Abrir Docker Desktop y esperar a que indique que el motor está ejecutándose. Después comprobar:

```bash
docker info
docker compose version
```

Si se modificaron dependencias o Dockerfiles, reconstruir con:

```bash
docker compose up --build
```

### Windows no permite ejecutar `./dev.sh`

Usar la ejecución manual en dos terminales descrita arriba, utilizando `mvnw.cmd` para el backend.

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
