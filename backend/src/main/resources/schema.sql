DROP TABLE IF EXISTS aristas;
DROP TABLE IF EXISTS espacio_aliases;
DROP TABLE IF EXISTS espacios;
DROP TABLE IF EXISTS nodos;
DROP TABLE IF EXISTS edificio_sinonimos;
DROP TABLE IF EXISTS edificio_aliases;
DROP TABLE IF EXISTS plantas;
DROP TABLE IF EXISTS edificios;

CREATE TABLE edificios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255)
);

CREATE TABLE edificio_aliases (
    edificio_id INTEGER NOT NULL,
    alias VARCHAR(255),
    FOREIGN KEY (edificio_id) REFERENCES edificios (id)
);

CREATE TABLE edificio_sinonimos (
    edificio_id INTEGER NOT NULL,
    sinonimo VARCHAR(255),
    FOREIGN KEY (edificio_id) REFERENCES edificios (id)
);

CREATE TABLE plantas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nivel INTEGER,
    nombre VARCHAR(255),
    orden_visual INTEGER,
    edificio_id INTEGER NOT NULL,
    FOREIGN KEY (edificio_id) REFERENCES edificios (id)
);

CREATE TABLE espacios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255),
    tipo VARCHAR(255),
    descripcion VARCHAR(255),
    alias VARCHAR(255),
    piso INTEGER,
    edificio_id INTEGER NOT NULL,
    planta_id INTEGER,
    FOREIGN KEY (edificio_id) REFERENCES edificios (id),
    FOREIGN KEY (planta_id) REFERENCES plantas (id)
);

CREATE TABLE espacio_aliases (
    espacio_id INTEGER NOT NULL,
    alias VARCHAR(255),
    FOREIGN KEY (espacio_id) REFERENCES espacios (id)
);

CREATE TABLE nodos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitud FLOAT,
    longitud FLOAT,
    nombre_referencia VARCHAR(255),
    es_entrada INTEGER,
    edificio_id INTEGER,
    espacio_id INTEGER,
    FOREIGN KEY (edificio_id) REFERENCES edificios (id),
    FOREIGN KEY (espacio_id) REFERENCES espacios (id)
);

CREATE TABLE aristas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nodo_origen_id INTEGER NOT NULL,
    nodo_destino_id INTEGER NOT NULL,
    peso FLOAT NOT NULL,
    FOREIGN KEY (nodo_origen_id) REFERENCES nodos (id),
    FOREIGN KEY (nodo_destino_id) REFERENCES nodos (id)
);
