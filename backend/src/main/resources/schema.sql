CREATE TABLE IF NOT EXISTS edificios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    nombre_busqueda VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS edificio_aliases (
    edificio_id INTEGER NOT NULL,
    alias VARCHAR(255),
    FOREIGN KEY (edificio_id) REFERENCES edificios (id)
);

CREATE TABLE IF NOT EXISTS edificio_sinonimos (
    edificio_id INTEGER NOT NULL,
    sinonimo VARCHAR(255),
    FOREIGN KEY (edificio_id) REFERENCES edificios (id)
);

CREATE TABLE IF NOT EXISTS edificio_imagenes (
    edificio_id INTEGER NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    FOREIGN KEY (edificio_id) REFERENCES edificios (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plantas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nivel INTEGER,
    nombre VARCHAR(255),
    orden_visual INTEGER,
    edificio_id INTEGER NOT NULL,
    FOREIGN KEY (edificio_id) REFERENCES edificios (id)
);

CREATE TABLE IF NOT EXISTS espacios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    nombre_busqueda VARCHAR(255) NOT NULL,
    tipo VARCHAR(255),
    descripcion VARCHAR(255),
    alias VARCHAR(255),
    piso INTEGER,
    edificio_id INTEGER NOT NULL,
    planta_id INTEGER,
    FOREIGN KEY (edificio_id) REFERENCES edificios (id),
    FOREIGN KEY (planta_id) REFERENCES plantas (id)
);

CREATE TABLE IF NOT EXISTS espacio_aliases (
    espacio_id INTEGER NOT NULL,
    alias VARCHAR(255),
    FOREIGN KEY (espacio_id) REFERENCES espacios (id)
);

CREATE TABLE IF NOT EXISTS nodos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitud FLOAT,
    longitud FLOAT,
    nombre_referencia VARCHAR(255),
    es_entrada INTEGER,
    edificio_id INTEGER,
    espacio_id INTEGER,
    zona_id INTEGER,
    zona_nombre VARCHAR(100),
    FOREIGN KEY (edificio_id) REFERENCES edificios (id),
    FOREIGN KEY (espacio_id) REFERENCES espacios (id)
);

CREATE TABLE IF NOT EXISTS aristas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nodo_origen_id INTEGER NOT NULL,
    nodo_destino_id INTEGER NOT NULL,
    peso FLOAT NOT NULL,
    FOREIGN KEY (nodo_origen_id) REFERENCES nodos (id),
    FOREIGN KEY (nodo_destino_id) REFERENCES nodos (id)
);

CREATE TABLE IF NOT EXISTS anotaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    texto VARCHAR(20),
    tipo VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    icono VARCHAR(50),
    tamano INTEGER NOT NULL DEFAULT 24,
    latitud FLOAT NOT NULL,
    longitud FLOAT NOT NULL,
    edificio_id INTEGER,
    espacio_id INTEGER,
    fecha_creacion TIMESTAMP,
    fecha_modificacion TIMESTAMP,
    visibilidad VARCHAR(20) NOT NULL DEFAULT 'PUBLICO'
);

CREATE TABLE IF NOT EXISTS anotacion_tags (
    anotacion_id INTEGER NOT NULL,
    tag VARCHAR(40) NOT NULL,
    FOREIGN KEY (anotacion_id) REFERENCES anotaciones (id) ON DELETE CASCADE
);
