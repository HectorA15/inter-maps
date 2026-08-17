// src/interfaces/ApiInterfaces.ts

// Mapeo estricto de EspacioDTO[cite: 9]
export interface Espacio {
    id: number;
    nombre: string;
    tipo: string;
    descripcion: string;
    alias: string[];
    piso: number;
}

// Mapeo estricto de EdificioDTO[cite: 6]
export interface Edificio {
    id: number;
    nombre: string;
    alias: string[];
    espacios: Espacio[];
}

// Mapeo estricto de SearchResultDTO[cite: 12]
export interface SearchResult {
    id: number;
    nombre: string;
    tipo: string;
}

// Mapeo estricto de ErrorResponse
export interface ApiError {
    timestamp: string; // En JSON, LocalDateTime llega como un string ISO 8601
    status: number;
    error: string;
    message: string;
}

// Envoltorio de Paginación de Spring Boot
export interface SpringPage<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

// Mapeo estricto del estándar GeoJSON que definiste en Java
export interface RutaGeoJson {
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
        type: 'LineString';
        coordinates: [number, number][]; // Un arreglo de tuplas matemáticas [longitud, latitud]
    };
}