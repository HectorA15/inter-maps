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

export interface Piso {
  nivel: number; // Ej: 0 (Planta Baja), 1 (Primer Piso)
  nombre: string; // Ej: "Planta Baja", "Piso 1"
  espacios: Espacio[]; // Los espacios le pertenecen al piso
}

// Mapeo estricto de EdificioDTO[cite: 6]
export interface Edificio {
  id: number;
  nombre: string;
  alias: string[];
  imagenes: string[];
  pisos: Piso[];
}

// Mapeo estricto de SearchResultDTO[cite: 12]
export interface SearchResult {
  id: number;
  nombre: string;
  tipo: string;
  edificioNombre?: string | null;
  imagenes?: string[];
}

export type TipoMarcador = "MARCADOR";

export interface Anotacion {
  id: number;
  nombre: string;
  texto: string | null;
  tipo: TipoMarcador | string;
  color: string;
  icono: string | null;
  nivelZoom: number;
  tamano: number;
  latitud: number;
  longitud: number;
  edificioId: number | null;
  espacioId: number | null;
  zonaId: number | null;
  zonaNombre: string | null;
  tags: string[];
  fechaCreacion: string | null;
  fechaModificacion: string | null;
  visibilidad: "PUBLICO" | "PRIVADO";
}

export interface AnotacionRequest {
  nombre?: string;
  texto?: string | null;
  tipo?: TipoMarcador | string;
  color?: string;
  icono?: string | null;
  nivelZoom?: number;
  tamano?: number;
  latitud: number;
  longitud: number;
  edificioId?: number | null;
  espacioId?: number | null;
  zonaId?: number | null;
  zonaNombre?: string | null;
  tags?: string[];
  visibilidad?: "PUBLICO" | "PRIVADO";
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
  pageable: unknown;
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
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // Un arreglo de tuplas matemáticas [longitud, latitud]
  };
}
