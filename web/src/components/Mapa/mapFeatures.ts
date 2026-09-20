import type { SearchResult } from "../../interfaces/ApiInterfaces";

interface MapFeature {
  properties?: Record<string, unknown>;
}

// Función para obtener un objeto SearchResult a partir de un feature del mapa
export function obtenerLugarDesdeFeature(
  feature: MapFeature | undefined,
): SearchResult | null {
  // Verifica si el feature y sus propiedades existen
  const properties = feature?.properties;
  if (!properties) return null;

  // Intenta obtener el nombre del lugar, priorizando nombre_zona sobre nombre
  const nombre = properties.nombre_zona ?? properties.nombre;
  if (typeof nombre !== "string" || !nombre.trim()) return null;

  // Devuelve un objeto SearchResult con id, nombre y tipo, asegurando que sean del tipo correcto
  return {
    id: typeof properties.fid === "number" ? properties.fid : -1,
    nombre: nombre.trim(),
    tipo:
      typeof properties.tipo_edificio === "string"
        ? properties.tipo_edificio.trim()
        : "ZONA",
  };
}
