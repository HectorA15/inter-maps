# InterMaps - Contexto del proyecto

Este archivo resume la arquitectura y las decisiones actuales de InterMaps para que una persona o agente pueda trabajar en el repositorio sin inspeccionar todos los archivos desde cero.

## Resumen

InterMaps es una aplicación web de mapas para el campus del Instituto Tecnológico de Nuevo León.

```text
Navegador
  -> React + Vite
  -> proxy /api
  -> Spring Boot
  -> SQLite
```

La aplicación permite:

- Visualizar el campus con MapLibre.
- Consultar edificios, plantas y espacios.
- Buscar edificios, espacios y zonas deportivas.
- Mostrar rutas GeoJSON.
- Seleccionar lugares desde el mapa o el buscador.
- Mostrar un panel lateral con el detalle del lugar.
- Cambiar entre tema claro y oscuro.
- Gestionar anotaciones geográficas persistentes para futuros globos, iconos y textos.

## Estructura principal

```text
.
├── backend/
│   ├── src/main/java/com/intermaps/
│   │   ├── config/          Configuración transversal, como CORS.
│   │   ├── controller/      Endpoints REST.
│   │   ├── dto/             Records de entrada y salida de la API.
│   │   ├── entity/          Entidades JPA.
│   │   ├── exception/       Excepciones de dominio.
│   │   ├── mapper/          Conversión entre entidades y DTOs.
│   │   ├── repository/      Interfaces Spring Data JPA.
│   │   ├── service/         Lógica de negocio.
│   │   └── util/            Utilidades y enums.
│   ├── src/main/resources/
│   │   ├── static/anotaciones/  SVGs servidos como recursos estáticos.
│   │   ├── schema.sql          Esquema SQLite ejecutado al iniciar.
│   │   └── *.geojson           Datos de edificios y navegación.
│   └── pom.xml
├── web/
│   ├── src/
│   │   ├── components/      Componentes React agrupados por funcionalidad.
│   │   ├── hooks/           Custom hooks de estado y comportamiento.
│   │   ├── interfaces/      Tipos TypeScript de respuestas del backend.
│   │   ├── services/        Cliente Axios y servicios HTTP.
│   │   └── test/            Pruebas Vitest.
│   ├── public/              GeoJSON, PMTiles e imágenes públicas.
│   ├── package.json
│   └── vite.config.ts
├── docker/
├── docker-compose.yml
├── dev.sh
├── README.md
└── CONTEXT.md
```

No considerar `web/node_modules`, `web/dist`, `backend/target`, logs ni archivos `.idea` como código fuente. Son artefactos generados o configuración local.

## Backend

### Stack

- Java 25.
- Spring Boot 4.1.0.
- Spring Web.
- Spring Data JPA.
- SQLite con `sqlite-jdbc`.
- `hibernate-community-dialects` para SQLite.
- Lombok.
- Jakarta Validation.
- H2 únicamente para pruebas.

### Flujo de capas

```text
Controller -> Service -> Repository
                    -> Mapper -> DTO
```

Reglas:

1. Los controllers reciben parámetros y DTOs, y devuelven DTOs.
2. Las entidades JPA no deben exponerse directamente al cliente.
3. Los services contienen la lógica de negocio.
4. Los repositories solo acceden a datos.
5. Los DTOs son `record`.
6. Usar inyección por constructor, normalmente mediante `@RequiredArgsConstructor`.
7. Validar entradas con anotaciones Jakarta (`@NotBlank`, `@NotNull`, `@Size`) y `@Valid`.
8. Para recursos inexistentes usar `RecursoNoEncontradoException`.
9. El manejo global de errores está en `controller/advice/GlobalExceptionHandler`.

### Catálogo existente

Base URL:

```text
/api/v1/catalogo
```

Endpoints:

```text
GET /data
GET /buscar?nombre=...
GET /espacio/{id}
GET /espacio/{id}/edificio
GET /edificio/{id}
GET /edificio?nombre=...
GET /mapa/edificios
```

El catálogo usa entidades de edificios, plantas y espacios. Las respuestas principales son `EdificioDTO`, `PlantaDTO`, `EspacioDTO` y `SearchResultDTO`.

### Anotaciones

La entidad `Anotacion` representa un globo o símbolo persistente del mapa. Actualmente contiene:

```text
id
nombre
texto
tipo
color
icono
tamano
latitud
longitud
fechaCreacion
fechaModificacion
visibilidad
```

`visibilidad` usa el enum:

```text
PUBLICO
PRIVADO
```

CRUD disponible:

```text
GET    /api/v1/anotaciones
GET    /api/v1/anotaciones/{id}
POST   /api/v1/anotaciones
PUT    /api/v1/anotaciones/{id}
DELETE /api/v1/anotaciones/{id}
```

Payload para crear o actualizar:

```json
{
  "nombre": "Baño edificio 1",
  "texto": "WC",
  "tipo": "BAÑO",
  "color": "#1971c2",
  "icono": "wc.svg",
  "tamano": 32,
  "latitud": 25.6654,
  "longitud": -100.244,
  "visibilidad": "PUBLICO"
}
```

Detalles:

- `nombre`, `tipo`, `latitud` y `longitud` son obligatorios.
- `tamano` usa `24` cuando no se envía.
- `visibilidad` usa `PUBLICO` cuando no se envía.
- El filtrado real por usuario aún no existe; `PRIVADO` se persiste, pero todavía no hay autenticación ni propietario asociado.
- `icono` debe guardar el nombre del SVG, no HTML ni SVG arbitrario.
- Los SVG se colocan en `backend/src/main/resources/static/anotaciones/` y se sirven como `/anotaciones/{archivo}`.

La tabla de anotaciones se define en `backend/src/main/resources/schema.sql`. Este proyecto configura:

```properties
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=always
```

Por tanto, `schema.sql` se ejecuta al arrancar y contiene instrucciones `DROP TABLE`. No asumir que los datos locales sobreviven a un reinicio: revisar esta decisión antes de convertir la base en producción.

## Frontend

### Stack

- React 19.
- TypeScript.
- Vite.
- Tailwind CSS.
- Axios.
- MapLibre GL.
- `react-map-gl/maplibre`.
- PMTiles.
- Vitest y Testing Library.

### Componentes

```text
web/src/components/
├── Buscador/
│   └── Buscador.tsx
├── Mapa/
│   ├── MapaCampus.tsx
│   └── mapFeatures.ts
├── PanelInfo/
│   ├── PanelInfo.tsx
│   ├── Tabs.tsx
│   ├── Imagenes.tsx
│   ├── EspaciosPiso.tsx
│   └── EspacioActivo.tsx
└── Tema/
    └── ColorTema.tsx
```

`App.tsx` compone la pantalla. La lógica de tema y selección está extraída a hooks.

### Hooks

`useTema.ts`:

- Mantiene `tema` (`claro` o `oscuro`).
- Detecta la preferencia inicial del sistema.
- Aplica la clase `dark` a `document.documentElement`.

`useLugarSeleccionado.ts`:

- Mantiene `lugarSeleccionado`.
- Mantiene `edificioDetalle`.
- Carga detalles desde `CatalogoService`.
- Normaliza `alias` y `pisos`.
- Permite seleccionar edificios, espacios y zonas del mapa.
- Expone `numeroSeleccion` para remontar el panel al seleccionar nuevamente el mismo lugar.

### App y selección

`App.tsx` pasa la misma función `seleccionarLugar` al mapa y al buscador:

```tsx
<MapaCampus onEdificioClick={seleccionarLugar} />
<Buscador onSelect={seleccionarLugar} />
```

`PanelInfo` recibe:

```tsx
item = { edificioDetalle };
busqueda = { lugarSeleccionado };
```

La `key` del panel incluye `numeroSeleccion` para que, después de cerrar el panel, volver a pulsar el mismo edificio lo remonte y ejecute la animación de entrada.

### MapaCampus

`MapaCampus.tsx`:

- Renderiza `react-map-gl/maplibre`.
- Registra el protocolo PMTiles.
- Carga el header de `/guadalupe.pmtiles` para actualizar centro y límites.
- Usa valores fallback si falla la lectura del header.
- Renderiza capas locales y overlays GeoJSON.
- Permite interacción sobre:
  - `campus-edificios`
  - `campus-deportes`
- Al pulsar una feature:
  - Convierte sus propiedades a `SearchResult` usando `mapFeatures.ts`.
  - Consulta el backend solo cuando el tipo es edificio.
  - Envía zonas como deportes o entradas sin consultar un edificio inexistente.

Las coordenadas de anotaciones deben ser geográficas:

```text
longitud, latitud
```

No usar posiciones relativas en píxeles para datos persistentes del mapa.

### API frontend

`web/src/services/apiClient.ts` crea un cliente Axios con:

```text
baseURL: VITE_API_BASE_URL || /api/v1
```

Durante desarrollo, Vite redirige `/api` al backend en `http://localhost:8080`.

Los nuevos servicios de anotaciones deben reutilizar este cliente y sus tipos. No crear otro cliente Axios sin una razón concreta.

## Anotaciones en el frontend: siguiente integración

La base backend ya permite CRUD. Para mostrar y editar globos, la implementación recomendada es:

1. Crear `Anotacion` y `AnotacionRequest` en `web/src/interfaces/`.
2. Añadir métodos de anotaciones a `apiClient.ts`.
3. Crear un hook `useAnotaciones` para cargar y mutar datos.
4. Representar anotaciones como `GeoJSONSource` de puntos en MapLibre.
5. Usar una capa `symbol` o `circle` para dibujar iconos y una capa `symbol` separada para texto.
6. Crear un panel de edición que primero coloque por clic.
7. Añadir arrastre después de que la creación, actualización y persistencia funcionen.

No guardar anotaciones únicamente en `localStorage`. La fuente de verdad debe ser el backend.

## Comandos de validación

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd web
npm run lint
npm run test -- --run
npm run build
```

Desarrollo manual:

```bash
cd backend
./mvnw spring-boot:run
```

En otra terminal:

```bash
cd web
npm run dev
```

También existe `./dev.sh` y configuración Docker mediante `docker-compose.yml`.

## Despliegue de prueba

`docker/backend.Dockerfile` usa dos etapas:

- `build`: compila el JAR con Maven.
- etapa final: ejecuta el JAR con Eclipse Temurin JRE 25 y copia `web/public/edificios.geojson` al contenedor.

Render debe usar la etapa final del Dockerfile. `docker-compose.yml` usa explícitamente la etapa `build` y `spring-boot:run` para conservar el flujo de desarrollo con volúmenes y hot reload.

La ingesta actual carga edificios, espacios y rutas desde `backend/src/main/resources` al arrancar. No depende de `data.sql`. Sin embargo, `schema.sql` se ejecuta con `spring.sql.init.mode=always` y elimina/recrea las tablas; por ello las anotaciones creadas en una instancia efímera se perderán al reiniciar. Para persistencia real se necesita un disco persistente o una base de datos externa.

En Vercel, configurar `VITE_API_BASE_URL` con la URL pública del backend terminada en `/api/v1`. No versionar archivos `.env.production` locales.

## Convenciones de trabajo

- Mantener cambios quirúrgicos y evitar refactors no relacionados.
- Reutilizar `CatalogoService`, `apiClient`, DTOs, mappers y componentes existentes.
- Preferir nombres en español cuando sigan el vocabulario actual del dominio.
- Usar `.ts` para lógica sin JSX y `.tsx` para componentes React.
- Los botones solo con icono deben tener `aria-label`.
- No ocultar errores con defaults silenciosos; registrar o propagar según el patrón existente.
- Antes de cambiar el modelo de anotaciones, considerar autenticación, propietario y persistencia real.
- No editar `web/node_modules`, `web/dist` ni `backend/target`.

IMPORTANTE. Seguir las siguientes reglas al momento de agregar codigo

1. Does this need to exist? → no: skip it (YAGNI)
2. Already in this codebase? → reuse it, don't rewrite
3. Stdlib does it? → use it
4. Native platform feature? → use it
5. Installed dependency? → use it
6. One line? → one line
7. Only then: the minimum that works

## Riesgos y decisiones pendientes

1. `schema.sql` reinicia tablas al arrancar. Esto es útil para datos de desarrollo, pero no es persistencia de producción.
2. `Anotacion.PRIVADO` todavía no puede asociarse a un usuario.
3. No existe aún autenticación ni autorización administrativa.
4. Los SVG son recursos estáticos del backend; aún no hay subida de archivos.
5. El editor Drag & Drop todavía no existe. Primero debe funcionar el flujo de colocar, guardar, actualizar y volver a cargar.
6. El layer de resaltado de edificios puede requerir implementación si se desea seleccionar visualmente una feature.
