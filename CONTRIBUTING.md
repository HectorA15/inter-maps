# Guía de colaboración

## Objetivo

Esta guía define el flujo mínimo para que varias personas trabajen en InterMaps sin modificar directamente la rama `web` ni depender de configuraciones locales que no están versionadas.

## Preparación inicial

### Opción recomendada: Docker

Instalar Git y Docker Desktop. Después ejecutar desde la raíz del repositorio:

```bash
docker compose up --build
```

Abrir `http://localhost:5173`.

### Opción manual

Instalar Java 25, Node.js 20 y Git. Desde la raíz:

```bash
cd web
npm ci
cd ..
./dev.sh
```

Abrir `http://localhost:5173`.

El frontend utiliza el proxy de Vite para enviar `/api` a `http://localhost:8080`. No es necesario crear `web/.env` para el desarrollo local.

## Flujo de ramas

En el flujo actual, `web` es la rama principal de integración. `main` conserva
la configuración base del proyecto y no debe recibir cambios directamente.

La rama `web` debe contener únicamente código integrado y funcional.

Antes de empezar una tarea:

```bash
git switch web
git pull --rebase origin web
git switch -c feature/nombre-corto
```

Para una corrección se puede utilizar el prefijo `fix/`:

```bash
git switch -c fix/carga-edificios
```

## Guardar y publicar cambios

Revisar los archivos modificados:

```bash
git status
git diff
```

Ejecutar las validaciones disponibles:

```bash
cd web
npm run build
npm test -- --run
cd ../backend
./mvnw test
```

Guardar un cambio relacionado en un commit:

```bash
git add ruta/del/archivo
git commit -m "fix(catalog): correct building loading"
git push -u origin feature/nombre-corto
```

Después se crea un Pull Request hacia `web`. Otra persona debe revisar el cambio antes de integrarlo.

## Formato de commits

Los commits nuevos deben usar **Conventional Commits** y escribirse en inglés.
Los commits históricos pueden conservar su idioma original; no es necesario
reescribir el historial compartido.

Formato:

```text
<type>(<scope>): <imperative description>
```

Tipos permitidos:

| Tipo | Uso |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `refactor` | Reestructuración sin cambiar el comportamiento |
| `docs` | Documentación |
| `test` | Pruebas |
| `chore` | Mantenimiento o configuración |
| `perf` | Mejora de rendimiento |
| `style` | Formato sin cambio de comportamiento |

El `scope` debe identificar el área afectada. Debe usarse una descripción corta,
en minúsculas, sin punto final y con un verbo en imperativo.

Ejemplos:

```text
feat(markers): add persistent marker management
fix(theme): improve dark mode placeholders
refactor(map): synchronize marker panel animation
docs(context): update project documentation
test(markers): add marker mapper tests
```

Evitar mensajes vagos como `cambios`, `arreglos`, `update`, `prueba` o
`terminado`. Cada commit debe representar un cambio relacionado y comprobable.

## Actualizar una rama mientras otras personas trabajan

Antes de continuar una tarea:

```bash
git fetch origin
git rebase origin/web
```

Si Git informa conflictos:

1. Abrir los archivos indicados y conservar la versión correcta.
2. Ejecutar `git add archivo-resuelto`.
3. Continuar con `git rebase --continue`.
4. Si se necesita cancelar el rebase, ejecutar `git rebase --abort`.

Después de un rebase de una rama ya publicada:

```bash
git push --force-with-lease
```

No utilizar `git push --force` porque puede sobrescribir el trabajo de otra persona.

## Reglas del equipo

- No hacer commits directamente sobre `web` ni `main`.
- No subir `web/.env`, contraseñas, tokens ni archivos de logs.
- No compartir `backend/intermaps.db` como fuente de datos entre desarrolladores.
- Mantener los datos iniciales en `backend/src/main/resources/edificios.json`.
- Mantener los cambios de API, DTOs y frontend en el mismo Pull Request cuando formen parte de una sola funcionalidad.
- Describir en el Pull Request qué cambió, cómo probarlo y qué limitaciones quedan.
